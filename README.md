# MotoCare

MotoCare is a lightweight motorcycle maintenance tracker built as a full-stack QA Automation portfolio project. It helps users track motorcycles, maintenance schedules, service logs, recent maintenance history, and derived maintenance states such as **On Track**, **Due Soon**, and **Overdue**.

## What this project demonstrates

- building and testing a stateful full-stack app
- frontend and backend validation working together
- SQLite persistence and derived domain logic
- Playwright E2E coverage across real user flows
- Playwright API testing for backend contract and validation checks
- CI execution through GitHub Actions
- testability-focused design: stable data-testid selectors, reusable Page Objects, isolated test data, and a resettable test DB workflow

## Features

### Authentication

- User registration
- User login
- Duplicate email prevention
- Input validation for email and password
- Per-user data isolation

![MotoCare login flow](docs/login.gif)

### Garage

- Add motorcycles
- Edit motorcycles
- Delete motorcycles
- Empty garage state
- Persist bike data in SQLite
- Validate year and odometer rules
- Keep garage data isolated per user
- Prevent invalid bike data through frontend + backend validation

![MotoCare add bike flow](docs/add-bike.gif)

### Maintenance

For each bike, MotoCare supports built-in maintenance items such as oil change and coolant change.

Users can:

- schedule maintenance by **days** and **kilometers**
- log completed maintenance with **date** and **odometer**
- view recent maintenance activity
- view status summaries:
  - **On Track**
  - **Due Soon**
  - **Overdue**

![MotoCare add maintenance flow](docs/add-maintenance.gif)

### Maintenance history and status

- Save maintenance log entries in the backend
- Persist current maintenance state across refresh and login
- Show the most recent maintenance history entry in the UI
- Derive maintenance status from schedule + last log + bike odometer
- Keep maintenance state isolated per bike and per maintenance item

## Tech stack

- **Frontend:** Vite + Vanilla TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Containerization:** Docker + Docker Compose
- **Testing:** Playwright
- **CI:** GitHub Actions

## Architecture

```text
/web    -> frontend client (Vite + TypeScript)
/api    -> backend REST API (Node + Express + TypeScript)
/tests  -> Playwright E2E tests, Page Objects, API tests, test helpers
SQLite  -> persistence layer
```

## Test coverage

The Playwright suite currently covers:

### Auth

- registration happy path
- duplicate registration
- missing or invalid credentials
- login happy path
- invalid login cases

### Garage

- create bike
- create-bike validation
- edit bike
- edit-bike validation
- delete bike
- empty-state behavior
- bike isolation

### Maintenance schedule

- open schedule modal
- valid save flow
- invalid or missing values
- cancel flow
- persistence after reload
- bike isolation
- maintenance item isolation

### Maintenance log

- open log modal
- valid save flow
- invalid odometer
- cancel flow
- persistence after reload
- bike isolation
- maintenance item isolation

### Maintenance history

- empty history state
- new history entry after log
- most recent history entry behavior
- persistence after reload
- bike isolation

### Maintenance status

- zero/default counts
- On Track
- Due Soon
- Overdue
- day-based and km-based transitions
- bike isolation

### API coverage

The project includes both Playwright E2E tests and Playwright API tests.

#### Auth API

- register success
- duplicate email rejection
- invalid email rejection
- password validation
- login success
- invalid login rejection
- missing field validation

#### Garage API

- create bike success
- invalid year rejection
- negative odometer rejection
- update bike success
- lower odometer rejection
- delete bike success

#### Maintenance API

- schedule success
- schedule validation errors
- log success
- invalid odometer rejection
- bike isolation
- maintenance item isolation

At the time of writing, the suite contains 114 Playwright tests.

## How tests are run

Playwright is initialized at the repo root because tests target the whole system, not just the frontend. The root test workflow resets a dedicated SQLite test database before running the suite.

### Root test harness

```bash
npm install
npm run test:e2e
```

### Other available commands

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
```

### Run Playwright against the Dockerized app

```bash
npm run db:test:reset
npm run docker:test:up
npm run test:docker
npm run docker:test:down
```

This runs the Playwright suite against the app served by Docker Compose, using a separate SQLite test database.

## Running locally

You need to run both the backend and the frontend.

Terminal 1 — API

```bash
cd api
npm install
npm run dev
```

Runs on http://localhost:3001.

Terminal 2 — Web

```bash
cd web
npm install
npm run dev
```

Runs on http://localhost:5173.

Then open the Vite URL shown in the terminal.

## Run with Docker

This project can be run with Docker Compose.

Start the full stack

```bash
docker compose up --build
```

### App URLs

Frontend: http://localhost:4173
API: http://localhost:3001

Stop the containers

```bash
docker compose down
```

## Notes

SQLite data is persisted through the ./api/data folder.
The API and frontend are containerized separately and run together through Docker Compose.

## CI

GitHub Actions runs the Playwright suite on push and pull request. CI setup includes:

- root test harness install
- api/ install
- web/ install
- Playwright browser install
- full E2E suite execution
- test report artifact upload
