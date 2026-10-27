# Hostel Management System

A hostel administration dashboard built with Angular and a JavaScript/Express API.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`. The Angular dashboard runs on port 4200 and the API on port 3001. If port 3001 is already in use, set `PORT` for the API and update the API URL in `src/app/app.component.ts` to match.

## API

- `GET /api/health` — service status
- `GET /api/dashboard` — live overview metrics
- `GET`, `POST`, `PUT`, `DELETE /api/students` — manage student records
- `GET`, `POST /api/rooms` — list and add rooms
- `GET`, `PUT /api/fees/:id` — list fees and record payments
- `GET`, `POST`, `PUT /api/requests` — create and update resident requests
- `GET /api/reports` — combined hostel report data

Demo records are stored in `server/data.json` and persist across API restarts. That local data file is excluded from Git.
