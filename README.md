# EcoPulse

Red de observaciones de fauna urbana en CABA (Buenos Aires): la gente sube fotos de animales que ve en la ciudad (aves, mascotas ferales, fauna silvestre ocasional), un modelo de IA identifica automáticamente qué es, aparece en un mapa en tiempo real, y se cruza con datos abiertos de biodiversidad de la zona (GBIF, eBird).

> 🚧 **Proyecto en desarrollo activo.** Login con JWT, creación autenticada de observaciones con ubicación PostGIS, listado público, cola de procesamiento (BullMQ) con un worker en Python que identifica la fauna con Gemini, y el mapa (React + react-leaflet) ya se actualiza **en vivo** vía Server-Sent Events cuando una observación termina de procesarse — sin recargar la página. Todavía falta: carga real de imagen desde el frontend (hoy se pega una URL a mano), pantallas de login/registro, validación robusta de uploads, observabilidad, tests e2e e infraestructura como código.

## Arquitectura

```
Cliente (React)
  → API (NestJS): recibe uploads, valida
    → Cola (BullMQ + Redis/Upstash): encola jobs de procesamiento
      → Worker (Python + bullmq-python): identifica la fauna con Gemini
        → Postgres + PostGIS: guarda el resultado con coordenadas geográficas
        → Redis Pub/Sub: publica el resultado en un canal
          → Realtime (NestJS + SSE): se suscribe al canal y expone /realtime/events
            → Cliente (React, EventSource): actualiza el mapa en vivo
```

En paralelo, un cron job sincroniza periódicamente con APIs abiertas (GBIF, eBird) y guarda snapshots ambientales en Postgres (por implementar).

## Stack

| Pieza | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| API | NestJS + TypeORM |
| Base de datos | Postgres + PostGIS (Neon) |
| Cola | BullMQ + Redis (Upstash) |
| Worker de IA | Python (asyncio) + `bullmq-python` + Gemini (`google-genai`) |
| Tiempo real | Redis Pub/Sub + SSE (NestJS `@Sse()`) + `EventSource` (browser) |

## Estructura del repo

Monorepo:

- `apps/api` — API en NestJS.
- `apps/web` — frontend en React + Vite.
- `apps/worker` — worker de identificación de fauna en Python.

## Levantar el proyecto en local

### API (`apps/api`)

```bash
cd apps/api
npm install
```

Crear un archivo `.env` con:

```
DATABASE_URL=postgresql://usuario:password@host/db
JWT_SECRET=algun-secreto
REDIS_URL=redis://usuario:password@host:puerto
```

Levantar en modo desarrollo (recarga automática):

```bash
npm run start:dev
```

### Worker (`apps/worker`)

```bash
cd apps/worker
python -m venv venv
venv\Scripts\pip.exe install -r requirements.txt
```

Crear un archivo `.env` con:

```
DATABASE_URL=postgresql://usuario:password@host/db
REDIS_URL=redis://usuario:password@host:puerto
GEMINI_API_KEY=tu-api-key-de-gemini
```

Correr el worker (a diferencia de la API, no se reinicia solo al editar código — hay que pararlo y volver a levantarlo):

```bash
venv\Scripts\python.exe main.py
```

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
npm run dev
```

## Roadmap

1. **Semana 1-2**: ✅ login real (JWT) + ✅ CRUD de observaciones (creación autenticada, listado público con PostGIS) + ✅ mapa estático en el frontend con react-leaflet.
2. **Semana 3**: ✅ cola (BullMQ) + worker en Python que identifica fauna con Gemini.
3. **Semana 4**: ✅ tiempo real — Redis Pub/Sub + SSE + `EventSource`, el mapa se actualiza en vivo sin recargar.
4. **Semana 4.5**: frontend a fondo — pantallas de login/registro, carga real de imagen (reemplaza pegar una URL a mano), pulido general del mapa.
5. **Semana 5**: observabilidad (logging, error tracking) + seguridad (rate limiting, validación de uploads).
6. **Semana 6**: tests e2e + infraestructura como código + staging/prod.
