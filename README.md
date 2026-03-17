# MotoCare

MotoCare is a lightweight motorcycle maintenance tracker that helps you stay on top of service intervals by **km** and/or **time**. It is a full-stack motorcycle maintenance tracker built as a QA Automation portfolio project. It manages motorcycles, maintenance schedules, service logs, recent service history, and derived status states like **On Track**, **Due Soon**, and **Overdue**. It’s designed to be a real, usable app, with a deterministic backend so it’s easy to test with Playwright and run via Docker.

## What this project demonstrates

MotoCare is not a static demo. It demonstrates work across the full app stack:

- **Frontend:** Vite + Vanilla TypeScript UI
- **Backend:** Express + TypeScript REST API
- **Persistence:** SQLite database
- **Automation:** Playwright E2E tests run from the repo root
- **API Testing:** direct backend contract and validation checks
- **CI:** GitHub Actions workflow running the Playwright suite
- **Testability:** "data-testid" selectors, reusable Page Objects, isolated test data, reset test DB workflow

## Current features

### Authentication

- User registration
- User login
- Duplicate email prevention
- Input validation for email and password
- Per-user data isolation

### Garage

- Add motorcycles
- Edit motorcycles
- Delete motorcycles
- Empty garage state
- Persist bike data in SQLite
- Validate year and odometer rules
- Keep garage data isolated per user
- Prevent invalid bike data through frontend + backend validation

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

### Maintenance history and status

- Save maintenance log entries in the backend
- Persist current maintenance state across refresh/login
- Show most recent maintenance history entry in the UI
- Derive maintenance status from schedule + last log + bike odometer
- Keep maintenance state isolated per bike and per maintenance item

## Tech stack

- **Frontend:** Vite + Vanilla TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Testing:** Playwright
- **CI:** GitHub Actions

## Architecture

```text
/web    -> frontend client (Vite + TypeScript)
/api    -> backend REST API (Node + Express + TypeScript)
/tests  -> Playwright E2E tests, Page Objects, test helpers
SQLite  -> persistence layer
```

## Test coverage

The Playwright suite currently covers:

### Auth

- registration happy path
- duplicate registration
- missing/invalid credentials
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
- invalid/missing values
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

-

At the time of writing, the suite contains 114 Playwright tests.

## How tests are run

Playwright is initialized at the repo root, because tests target the whole system, not just the frontend. The root test command resets a dedicated SQLite test database before running the suite.

```bash
npm run test:e2e
```

Other available commands:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
```

## Running locally

You need to run both the frontend and the backend.

Terminal 1 — API

```bash
cd api
npm install
npm run dev
```

Terminal 2 — Web

```bash
cd web
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Root test harness

```bash
npm install
npm run test:e2e
```

## CI

GitHub Actions runs the Playwright suite on push / pull request. CI setup includes:

- root test harness install
- api/ install
- web/ install
- Playwright browser install
- full E2E suite execution
- test report artifact upload

## Next steps

Planned next improvements:

- add screenshots / GIFs for README presentation
- tighten reusable test helpers further
- improve API test organization and shared helpers
