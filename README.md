# MotoCare Maintenance Tracker

MotoCare Maintenance Tracker is a lightweight motorcycle maintenance tracker built as a full-stack QA Automation portfolio project. It helps riders track maintenance schedules, service logs, recent maintenance history, and derived maintenance states such as **On Track**, **Due Soon**, and **Overdue**.

**Live app:** https://motocaremaintenance.petromirkolev.com/

## What this project demonstrates

- building and testing a stateful full-stack application
- frontend and backend validation working together
- PostgreSQL persistence and derived maintenance domain logic
- Playwright E2E and API coverage
- CI execution through GitHub Actions
- testability-focused design: stable data-testid selectors, reusable Page Objects, fixtures/helpers, isolated test data, and separate local test database workflows for source-based and Docker-based runs
- real deployment with **Render + Neon**, plus local source-based and Docker-based test workflows

## Features

### Authentication

- User registration
- User login
- Duplicate email prevention
- Input validation for email and password
- Per-user data isolation

![MotoCare Maintenance Tracker login flow](docs/login.gif)

### Garage

- Add motorcycles
- Edit motorcycles
- Delete motorcycles
- Empty garage state
- Persist bike data in PostgreSQL
- Validate year and odometer rules
- Keep garage data isolated per user
- Prevent invalid bike data through frontend + backend validation

![MotoCare Maintenance Tracker add bike flow](docs/add-bike.gif)

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

![MotoCare Maintenance Tracker add maintenance flow](docs/add-maintenance.gif)

### Maintenance history and status

- Save maintenance log entries in the backend
- Persist current maintenance state across refresh and login
- Show the most recent maintenance history entry in the UI
- Derive maintenance status from schedule + last log + bike odometer
- Keep maintenance state isolated per bike and per maintenance item

## Tech stack

- **Frontend:** Vite + Vanilla TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (local Docker for development/tests, Neon in production)
- **Containerization:** Docker + Docker Compose
- **Testing:** Playwright
- **CI:** GitHub Actions
- **Deployment:** Render + Neon

## Architecture

```text
/web    -> frontend client (Vite + TypeScript)
/api    -> backend REST API (Node + Express + TypeScript)
/tests  -> Playwright E2E tests, Page Objects, API tests, test helpers
Local   -> frontend/backend from source + PostgreSQL in Docker
Docker  -> full local containerized stack
Prod    -> Render + Neon deployment
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

Playwright is initialized at the repo root because tests target the whole system, not just the frontend.

The project supports three execution modes:

- **Local** - frontend/backend run from source on the machine, PostgreSQL runs in Docker
- **Docker** - frontend/backend/database all run in Docker

### Run Playwright locally

```bash
npm install
npm run db:create
npm run db:up
npm run test:local
npm run db:down
```

Other available commands:

```bash
npm run test:local:ui
```

### Run Playwright against the Dockerized app

```bash
npm run test:docker:fresh
```

Or step by step:

```bash
npm run db:test:reset
npm run docker:test:up
npm run docker:test
npm run docker:test:down
```

This runs the Playwright suite against the fully Dockerized app stack, using a separate PostgreSQL test database.

## Running locally

MotoCare supports a local development setup where:

- **API** runs from source on your machine
- **frontend** runs from source on your machine
- **PostgreSQL** runs in Docker

### Environment files

The API uses separate environment files for local development and automated tests.

Example local development values:

```text
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/motocare_maintenance_dev
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/motocare_maintenance_test
NODE_ENV=development
```

### Start PostgreSQL

```bash
npm run db:up
```

### Terminal 1 — API

```bash
cd api
npm install
npm run dev
```

Runs on http://localhost:3001.

### Terminal 2 — Web

```bash
cd web
npm install
npm run dev
```

Runs on http://localhost:5173.

Then open the Vite URL shown in the terminal.

## Run with Docker

This project can also be run as a fully containerized local stack.

### Start the full stack

```bash
docker compose up --build
```

### App URLs

- **Frontend**: http://localhost:4173
- **API**: http://localhost:3001

### Stop the containers

```bash
docker compose down
```

## Deployment

**Frontend**: Render Static Site
**Backend**: Render Web Service
**Database**: Neon PostgreSQL

This project is deployed as a real full-stack application, not just a static frontend.

## CI

GitHub Actions runs the Playwright suite on push and pull request. CI setup includes:

- root test harness install
- api/ install
- web/ install
- Playwright browser install
- full E2E suite execution
- test report artifact upload

## Notes

- The app uses separate database targets for local development, automated tests, and live deployment.
- The live deployment runs on free-tier infrastructure, so the first request may be slower due to cold starts.
