# Genderize Classifier API (stage 0)

A single `GET` endpoint that integrates with the [Genderize.io](https://genderize.io) API and returns a processed, structured response.

---

## Stack

- **Runtime** — Node.js 18+
- **Framework** — Express 4
- **Dependencies** — zero production deps beyond Express (uses Node's built-in `https` module for upstream calls)

---

## Project Structure

```
src/
  app.js                  # Express app (middleware + routes)
  server.js               # HTTP server entry point
  routes/
    classify.js           # GET /api/classify handler + validation
  services/
    genderize.js          # Upstream Genderize API client
  utils/
    processResponse.js    # Response processing & confidence logic
vercel.json               # Vercel deployment config
Procfile                  # Railway / Heroku process file
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (auto-reloads on change)
npm run dev

# 3. Test the endpoint
curl "http://localhost:3000/api/classify?name=john"
```

---

## API Reference

### `GET /api/classify?name={name}`

**Success — 200**
```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**Error — 400** (missing or empty `name`)
```json
{ "status": "error", "message": "Missing or empty name parameter" }
```

**Error — 422** (`name` is not a string, e.g. `name[]=john`)
```json
{ "status": "error", "message": "name must be a string" }
```

**Error — 200** (Genderize returns null gender or zero count)
```json
{ "status": "error", "message": "No prediction available for the provided name" }
```

**Error — 502** (upstream unreachable or timed out)
```json
{ "status": "error", "message": "Could not reach upstream API" }
```

### Processing Rules

| Field | Source |
|---|---|
| `name` | Passed through from Genderize |
| `gender` | Passed through from Genderize |
| `probability` | Passed through from Genderize |
| `sample_size` | Renamed from Genderize's `count` |
| `is_confident` | `probability >= 0.7 AND sample_size >= 100` |
| `processed_at` | `new Date().toISOString()` — UTC, ISO 8601, generated fresh per request |

---

## Deployment
### Railway

1. Push to GitHub
2. New project → Deploy from GitHub repo
3. Railway auto-detects Node and runs `npm start` (or uses the `Procfile`)
4. Grab your public URL from the Railway dashboard

---

