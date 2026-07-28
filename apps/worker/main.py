import asyncio
import json
import os
import signal

from bullmq import Worker
from dotenv import load_dotenv
import asyncpg
import requests
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from redis.asyncio import Redis

load_dotenv()

client = genai.Client()

class AnalisisFauna(BaseModel):
    nombre_comun: str | None = Field(description="Nombre común en español, o null si no se puede identificar")
    nombre_cientifico: str | None = Field(description="Nombre científico (Género y especie), o null si no se puede identificar")
    grupo: str | None = Field(description="Categoría: Ave, Mamífero, Insecto, Reptil, Anfibio, Otro. Null si no se identifica")
    descripcion_breve: str | None = Field(description="Breve descripción de lo observado en la imagen")
    certeza_identificacion: float = Field(description="Confianza de la identificación, entre 0.0 y 1.0")


pool = None
redis_client = None

async def process(job, job_token):
    observation_id = job.data.get("observationId")
    if not observation_id:
        print("Missing observationId in job.data:", job.data)
        return

    try:
        row = await pool.fetchrow(
            'SELECT "imageUrl", ST_AsGeoJSON("location") AS location, status, "createdAt" FROM observation WHERE id = $1',
            observation_id,
        )
        if row and row["status"] == "processed":
            return
        if not row:
            raise ValueError(f"Observation {observation_id} not found")

        username = None
        if isinstance(job.data, dict):
            username = job.data.get("username")
        elif hasattr(job.data, "get"):
            username = job.data.get("username")

        image_bytes = requests.get(row["imageUrl"]).content
        image_input = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/jpeg",
        )
        prompt = (
            "Identifica la fauna urbana presente en esta imagen. Devuelve un JSON con "
            "nombre_comun, nombre_cientifico, grupo, descripcion_breve y certeza_identificacion. "
            "Si no se puede identificar algún campo, usa null."
        )
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=[image_input, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnalisisFauna,
                temperature=0.1,
            ),
        )
        print(response.text)

        resultado = AnalisisFauna.model_validate_json(response.text)

        await pool.execute(
            'UPDATE observation SET "commonName" = $1, "scientificName" = $2, "group" = $3, "description" = $4, "confidenceScore" = $5, status = $6 WHERE id = $7',
            resultado.nombre_comun,
            resultado.nombre_cientifico,
            resultado.grupo,
            resultado.descripcion_breve,
            resultado.certeza_identificacion,
            "processed",
            observation_id,
        )

        payload = {
            "observationId": observation_id,
            "commonName": resultado.nombre_comun,
            "scientificName": resultado.nombre_cientifico,
            "group": resultado.grupo,
            "description": resultado.descripcion_breve,
            "status": "processed",
            "imageUrl": row["imageUrl"],
            "createdAt": row["createdAt"].isoformat() if row["createdAt"] is not None else None,
            "location": row["location"],
            "username": username,
        }
        if redis_client is not None:
            try:
                await redis_client.publish("observation-updates", json.dumps(payload))
            except Exception as publish_exc:
                print("Failed to publish observation update:", publish_exc)
    except Exception as exc:
        attempts_made = getattr(job, "attemptsMade", None)
        attempts_allowed = None
        opts = getattr(job, "opts", None)
        if isinstance(opts, dict):
            attempts_allowed = opts.get("attempts")
        if attempts_allowed is None:
            attempts_allowed = getattr(job, "attempts", None)

        print(
            "Processing failed for observation",
            observation_id,
            "error:",
            exc,
            "attempts_made:",
            attempts_made,
            "attempts_allowed:",
            attempts_allowed,
        )

        is_last_attempt = False
        if attempts_made is not None and attempts_allowed is not None:
            if (isinstance(attempts_made, int) and isinstance(attempts_allowed, int)
                    and attempts_made + 1 >= attempts_allowed):
                is_last_attempt = True
        if attempts_made is None or attempts_allowed is None:
            is_last_attempt = True

        if is_last_attempt:
            try:
                await pool.execute(
                    'UPDATE observation SET status = $1 WHERE id = $2',
                    "failed",
                    observation_id,
                )
            except Exception as update_exc:
                print("Failed to update observation status to failed:", update_exc)

        raise

async def main():
    global pool, redis_client
    pool = await asyncpg.create_pool(os.getenv("DATABASE_URL"))
    redis_client = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
    worker = Worker("observation-queue", process, {"connection": os.getenv("REDIS_URL")})
    
    stop_event = asyncio.Event()
    
    def signal_handler():
        stop_event.set()
    
    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            asyncio.get_event_loop().add_signal_handler(sig, signal_handler)
        except NotImplementedError:
            pass
    
    await stop_event.wait()
    await worker.close()

if __name__ == "__main__":
    asyncio.run(main())
    