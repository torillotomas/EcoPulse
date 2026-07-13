# EcoPulse

Red de observaciones de fauna urbana en CABA (Buenos Aires): la gente sube fotos de animales que ve en la ciudad (aves, mascotas ferales, fauna silvestre ocasional), un modelo de IA identifica automáticamente qué es, aparece en un mapa en tiempo real, y se cruza con datos abiertos de biodiversidad de la zona (GBIF, eBird).

> 🚧 **Proyecto en desarrollo activo.** Login con JWT, creación autenticada de observaciones con ubicación PostGIS, listado público, y ya hay un mapa estático en el frontend (React + react-leaflet) mostrando las observaciones sobre CABA. Todavía no hay identificación por IA ni tiempo real — eso viene en las próximas semanas.

## Arquitectura

```
Cliente (React)
  → API (NestJS): recibe uploads, valida
    → Cola (BullMQ + Redis): encola jobs de procesamiento
      → Worker ML (FastAPI): identifica la especie/tipo (IA)
        → Postgres + PostGIS: guarda con coordenadas geográficas
          → Realtime (WebSocket/SSE): push en vivo al mapa
```

En paralelo, un cron job sincroniza periódicamente con APIs abiertas (GBIF, eBird) y guarda snapshots ambientales en Postgres.

## Stack

| Pieza | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| API | NestJS + TypeORM |
| Base de datos | Postgres + PostGIS (Neon) |
| Worker de IA | FastAPI (por implementar) |
| Cola | BullMQ + Redis (por implementar) |

## Estructura del repo

Monorepo:

- `apps/api` — API en NestJS.
- `apps/web` — frontend en React + Vite.

## Levantar el proyecto en local

### API (`apps/api`)

```bash
cd apps/api
npm install
```

Crear un archivo `.env` con:

```
DATABASE_URL=postgresql://usuario:password@host/db
```

Levantar en modo desarrollo (recarga automática):

```bash
npm run start:dev
```

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
npm run dev
```

## Roadmap

1. **Semana 1-2**: ✅ login real (JWT) + ✅ CRUD de observaciones (creación autenticada, listado público con PostGIS) + ✅ mapa estático en el frontend con react-leaflet.
2. **Semana 3**: cola + worker de IA para identificación automática.
3. **Semana 4**: tiempo real — el mapa se actualiza en vivo.
4. **Semana 5**: observabilidad (logging, error tracking) + seguridad (rate limiting, validación de uploads).
5. **Semana 6**: tests e2e + infraestructura como código + staging/prod.
