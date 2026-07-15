import asyncio
from bullmq import Worker
import os
from dotenv import load_dotenv
import asyncpg
import requests
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()

client = genai.Client()

class AnalisisFauna(BaseModel):
    nombre_comun: str | None = Field(description="Nombre común en español, o null si no se puede identificar")
    nombre_cientifico: str | None = Field(description="Nombre científico (Género y especie), o null si no se puede identificar")
    grupo: str | None = Field(description="Categoría: Ave, Mamífero, Insecto, Reptil, Anfibio, Otro. Null si no se identifica")
    descripcion_breve: str | None = Field(description="Breve descripción de lo observado en la imagen")
    certeza_identificacion: float = Field(description="Confianza de la identificación, entre 0.0 y 1.0")


pool = None

async def process(job, job_token):
    observation_id = job.data.get("observationId")
    if not observation_id:
        print("Missing observationId in job.data:", job.data)
        return

    try:
        row = await pool.fetchrow(
            'SELECT "imageUrl" FROM observation WHERE id = $1',
            observation_id,
        )
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
    except Exception as exc:
        print("Processing failed for observation", observation_id, exc)
        try:
            await pool.execute(
                'UPDATE observation SET status = $1 WHERE id = $2',
                "failed",
                observation_id,
            )
        except Exception as update_exc:
            print("Failed to update observation status to failed:", update_exc)
        return

async def main():
    global pool
    pool = await asyncpg.create_pool(os.getenv("DATABASE_URL"))
    worker = Worker("observation-queue", process, {"connection": os.getenv("REDIS_URL")})
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
    