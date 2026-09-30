# 10K Run Tracker

[![CI](https://github.com/Anshu972438/10k-run-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Anshu972438/10k-run-tracker/actions/workflows/ci.yml)

A small full-stack app to log runs, see where each run started and ended on Google Maps, and track the total distance across all runs.

Built as a time-boxed (~4 hour) take-home assignment: the focus is on simple, readable code that covers every requirement, not on production-grade infrastructure.

## Features

- **Add a run** with a start location, an end location, an optional date (defaults to today) and an optional time (h/min/sec). Locations are picked with Google Places search, so every run has exact coordinates.
- **Pace** (min/km) for every run with a time, calculated by the server from the time and the distance.
- **Map** of the selected run with a green **S** (start) and a red **E** (end) marker, a dashed line between them, and the view zoomed to fit both points. The newest run is shown by default; click a run in the history to show it.
- **Total distance** across all runs, shown prominently, together with the number of runs and the average distance per run.
- **Run history**, newest first and grouped by day, with delete (with confirmation). Click a day to open its **daily summary** (`#day/YYYY-MM-DD`): distance, runs, time, average pace and the runs of that day.
- **Run details page** (`#run/7`): click any run to see its distance, time, pace and average speed, how it compares with your other runs, its own map, and the start and end coordinates.
- **Statistics page** (`#stats`) with total distance, total time, average distance and pace, longest and shortest run, and distance per month. The summary tiles link to it and to the run history.
- **Persistent storage** in PostgreSQL, so data survives restarts of the app and the database.
- **Validation and readable errors**: invalid input returns `400` with a clear message, a missing run returns `404`, and unexpected errors return a generic `500` without a stack trace.
- **Tests and CI**: 26 backend tests and 36 frontend tests, run by GitHub Actions on every push.

## Tech stack

| Part | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4.0.5 (Web MVC, Data JPA, Validation), Maven wrapper |
| Database | PostgreSQL 16 in Docker; H2 in-memory for tests |
| Frontend | React 19, Vite 8, `@vis.gl/react-google-maps` |
| Maps | Google Maps JavaScript API, Places API (New) |
| Tests | JUnit 5, Mockito, MockMvc, AssertJ; Vitest, React Testing Library |
| CI | GitHub Actions |

## Architecture

```
Browser (React, http://localhost:5173)
  │  fetch("/api/...")                    Google Maps JS + Places (loaded in the browser)
  ▼
Vite dev server ── proxy /api ──► Spring Boot REST API (http://localhost:8080)
                                    │
                                    │  RunController   HTTP, validation (@Valid), status codes
                                    │  RunService      default date, distance, mapping to DTOs
                                    │  RunRepository   Spring Data JPA (+ SUM query)
                                    ▼
                                  PostgreSQL 16 (Docker, localhost:5433, named volume)
```

- **Backend layers**: controller → service → repository → entity. The controller only returns DTOs (Java records), never the JPA entity.
- **Errors**: a single `@RestControllerAdvice` turns every error into `{ "message": ..., "timestamp": ... }`.
- **Frontend**: plain React hooks (no Redux, no router library). The statistics, daily summary and run details pages are chosen by the URL hash (`#stats`, `#day/2026-09-30`, `#run/7`), so links and the browser back button work without a router. All HTTP calls live in `src/services/runApi.js` and use relative `/api/...` URLs; the Vite proxy forwards them to Spring Boot, so no CORS configuration is needed.

## Prerequisites

- Java 21
- Node.js 22.13+ (or 20.19+) and npm
- Docker with Docker Compose
- A Google Maps API key (see [Google Maps setup](#google-maps-setup))

Maven does not need to be installed; the project uses the Maven wrapper (`./mvnw`).

## Quick start

Run each part in its own terminal, from the repository root.

**1. Start the database**

```bash
docker compose up -d
```

This starts PostgreSQL 16 on **port 5433** (not 5432, to avoid clashing with a local PostgreSQL). Data is stored in the `run-tracker-data` volume.

**2. Start the backend**

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on http://localhost:8080. Hibernate creates the `runs` table on first start.

**3. Start the frontend**

```bash
cd frontend
cp .env.example .env.local     # then put your Google Maps API key in .env.local
npm install
npm run dev
```

Open http://localhost:5173.

Without a Google Maps key the app still runs: the total and the run history work, and a message explains that the map and the location search need a key. If the key is invalid, an error boundary replaces only the map and the form with a message, so the rest of the page keeps working.

## Google Maps setup

The frontend reads two variables from `frontend/.env.local` (git-ignored, never committed):

```
VITE_GOOGLE_MAPS_API_KEY=your-key-here
VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID
```

To create a key:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create or pick a project.
2. Make sure the project has an **active billing account**. Google requires this for all Maps Platform APIs, even though normal use of this app stays within the free monthly usage.
3. Enable **Maps JavaScript API** and **Places API (New)**.
4. Create an API key and restrict it:
   - **Application restrictions → Websites**: `http://localhost:5173/*`
   - **API restrictions**: Maps JavaScript API and Places API (New)
5. Put the key in `frontend/.env.local` and restart `npm run dev` (Vite only reads env files at startup).

`DEMO_MAP_ID` is Google's public map ID for development; a map ID is required for the Advanced Markers used for the S/E pins.

I can also share a restricted key privately if that is easier for reviewing.

## Configuration

The backend reads its database settings from environment variables, with defaults that match `docker-compose.yml`:

| Variable | Default |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/run_tracker` |
| `DB_USERNAME` | `runtracker` |
| `DB_PASSWORD` | `runtracker` |

These are local development credentials for the Docker database only.

## API

Base URL: `http://localhost:8080/api/runs`

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| `POST` | `/api/runs` | Create a run | `201` + run | `400` invalid input |
| `GET` | `/api/runs` | List runs, newest first | `200` + list | |
| `GET` | `/api/runs/summary` | Total runs and total distance | `200` | |
| `DELETE` | `/api/runs/{id}` | Delete a run | `204` | `404` not found, `400` invalid id |

**Create a run** (`runDate` is optional and defaults to today; `durationSeconds` is optional):

```bash
curl -i -X POST http://localhost:8080/api/runs \
  -H "Content-Type: application/json" \
  -d '{"startLocation":"Big Ben, London","startLatitude":51.5007,"startLongitude":-0.1246,
       "endLocation":"Tower Bridge, London","endLatitude":51.5055,"endLongitude":-0.0754,
       "runDate":"2026-09-28","durationSeconds":1200}'
```

```json
{"id":1,"startLocation":"Big Ben, London","startLatitude":51.5007,"startLongitude":-0.1246,
 "endLocation":"Tower Bridge, London","endLatitude":51.5055,"endLongitude":-0.0754,
 "distanceKm":3.45,"runDate":"2026-09-28","durationSeconds":1200,"paceSecondsPerKm":348}
```

**List runs**

```bash
curl http://localhost:8080/api/runs
```

**Summary**

```bash
curl http://localhost:8080/api/runs/summary
```

```json
{"totalRuns":1,"totalDistanceKm":3.45}
```

**Delete a run**

```bash
curl -i -X DELETE http://localhost:8080/api/runs/1
```

**Validation rules**: both location names are required (max 255 characters), all four coordinates are required, latitude must be between -90 and 90, longitude between -180 and 180, `durationSeconds` (if given) a whole number between 1 and 86400 (24 hours), and `runDate` (if given) not in the future. Example error:

```json
{"message":"startLatitude must be less than or equal to 90, startLocation must not be blank","timestamp":"2026-09-30T10:15:30Z"}
```

## Database model

Table `runs`:

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | primary key, generated |
| `start_location` | varchar(255) | not null |
| `start_latitude` | double precision | not null |
| `start_longitude` | double precision | not null |
| `end_location` | varchar(255) | not null |
| `end_latitude` | double precision | not null |
| `end_longitude` | double precision | not null |
| `distance_km` | double precision | calculated by the server, 2 decimals |
| `run_date` | date | not null, defaults to today |
| `duration_seconds` | integer | optional; runs without a recorded time have none |
| `created_at` | timestamp with time zone | set when the run is saved |

**Pace is not stored** either: `paceSecondsPerKm` in the API response is calculated from `duration_seconds / distance_km` (rounded to whole seconds), and is `null` when a run has no time, or when start and end are the same place (0 km).

The total distance is **not stored**. It is always calculated with a `SUM` query over the `runs` table, so it can never get out of sync with the runs (for example after a delete), and it is 0 when there are no runs.

## Distance calculation

The distance of a run is the straight-line (great-circle) distance between the start and end coordinates, calculated on the server with the **Haversine formula** (`DistanceCalculator`), using an Earth radius of 6371 km and rounded to 2 decimals. The client never sends a distance, so it cannot be faked. The dashed line on the map is drawn as a geodesic line, which is the same path the formula measures.

## Testing

**Backend** (no database or Docker needed; tests use H2 in-memory):

```bash
cd backend
./mvnw test
```

- `DistanceCalculatorTest`: Haversine results, same point, symmetry, rounding.
- `RunServiceTest`: business rules with Mockito and no Spring context (default date, distance, duration and pace, ordering, rounded total, empty summary, delete and not found).
- `RunControllerIntegrationTest`: MockMvc + H2 through all layers (create, create with duration and pace, list, summary, empty summary, invalid input, zero duration, delete, not found).

**Frontend** (Google Places and the API are mocked):

```bash
cd frontend
npm test
npm run lint
```

- `DistanceSummary`: total, run count, average, and the zero state.
- `RunList`: empty state, rendering, time and pace, grouping by day with a link to the daily summary, selecting a run, delete only after confirmation.
- `RunForm`: submit stays disabled until both places are selected, typed dates are sent as `YYYY-MM-DD`, the time is sent in seconds, invalid dates or times block submitting, successful save, and error display.
- `StatsPage`: longest and shortest run, average, and the empty state.
- `DayPage`: totals and pace for one day only, opening a run, and a day without runs.
- `RunPage`: time, pace and speed, comparison with the other runs, the link to the day, a run without a time, and a run that does not exist.
- `format` helpers: duration, pace and average pace over runs with and without a time.
- `MapsErrorBoundary`: a Google Maps error shows a message instead of blanking the page.

**CI**: `.github/workflows/ci.yml` runs the backend tests and the frontend lint, tests and build on every push to `main` and on pull requests.

## Assumptions

- **"10K" is the goal and theme** of the app. Individual runs are not required to be exactly 10 km.
- A run is described by its **start and end point only**; the route actually run in between is not tracked.
- When no date is given, "today" is the **server's local date** (from an injectable `Clock`, so tests use a fixed date). Future dates are rejected.
- Location names are stored as the short name returned by Google Places (for example "Big Ben"), falling back to the formatted address.
- This is a **single-user** app running locally; there is no login.

## Trade-offs

- **Straight-line distance instead of route distance.** Haversine is simple, free and has no external dependency on the backend. A real running route is longer; the Google Routes API with walking directions would give route distance at the cost of an extra paid API call and a new failure point.
- **Plain layered CRUD instead of event sourcing / messaging.** An event-driven architecture with commands, domain events and read models is valuable at scale, but for one small domain in a ~4 hour scope it would add complexity without benefit.
- **`ddl-auto=update` instead of database migrations.** Hibernate creates the schema automatically, which keeps setup to one command. For production I would use Flyway migrations.
- **H2 for tests instead of PostgreSQL.** Tests are fast and need no Docker. The trade-off is small SQL differences; Testcontainers with a real PostgreSQL would close that gap.
- **Local PostgreSQL in Docker instead of a hosted database.** No credentials in the repository, and the reviewer starts it with one command.
- **Only the database runs in Docker.** The backend and frontend run with their normal dev tools, which keeps the setup transparent. Containerising both would be a straightforward next step.
- **Vite proxy instead of CORS configuration.** The browser only talks to one origin during development, so the backend needs no CORS setup.
- **Browser-side Google Maps key.** A Maps JavaScript key is always visible in the browser; it is protected by website and API restrictions rather than by keeping it secret.
- **No authentication**, as it is out of scope for the assignment.

## Future improvements

- Route distance and route line with the Google Routes API.
- Edit runs, and filter or paginate the history.
- Flyway migrations and Testcontainers-based integration tests.
- Dockerfiles for the backend and frontend, so the whole stack starts with `docker compose up`.
- User accounts, so each runner sees only their own runs.
- Progress towards a personal 10K goal (for example total distance per week).

## Project structure

```
backend/
  src/main/java/com/runtracker/
    controller/   RunController
    service/      RunService, DistanceCalculator
    repository/   RunRepository
    entity/       Run
    dto/          CreateRunRequest, RunResponse, RunSummaryResponse, ErrorResponse
    exception/    GlobalExceptionHandler, RunNotFoundException
  src/test/       unit and integration tests (H2)
frontend/
  src/
    App.jsx       page layout and state
    components/   DistanceSummary, RunForm, LocationSearch, RunMap, RunList, StatsPage,
                  DayPage, RunPage, StatCard, MapsErrorBoundary (+ tests)
    utils/        format.js (dates, durations, pace)
    services/     runApi.js
docker-compose.yml   PostgreSQL 16
.github/workflows/   CI
```
