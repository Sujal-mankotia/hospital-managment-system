Server setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` (Atlas connection string) and `PORT`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Run server in dev:

```bash
npm run dev
```

API endpoints:
- `GET /api/patients` — list (query: q, status, page, limit)
- `GET /api/patients/:id` — get one
- `POST /api/patients` — create (form-data, optional `photo` file)
- `PUT /api/patients/:id` — update (form-data, optional `photo` file)
- `DELETE /api/patients/:id` — delete
- `GET /api/appointments` — list appointments (query: q, status, doctor, date, page, limit)
- `GET /api/appointments/:id` — get one appointment
- `POST /api/appointments` — create appointment linked to a patient by `patientId`
- `PUT /api/appointments/:id` — reschedule, cancel, or update appointment
- `DELETE /api/appointments/:id` — delete appointment

Uploads are served from `/uploads` static path.
