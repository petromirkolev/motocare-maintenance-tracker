# Moto Care

Moto Care is a lightweight motorcycle maintenance tracker that helps you stay on top of service intervals by **km** and/or **time**. It’s designed to be a real, usable app, with a deterministic backend so it’s easy to test with Playwright and run via Docker.

## Current features

### Authentication

- User registration
- User login
- Backend validation for auth input
- Per-user data separation

### Garage

- Add motorcycles
- Edit motorcycles
- Delete motorcycles
- Persist bikes in SQLite
- Prevent invalid bike data through frontend + backend validation

### Maintenance

- Open a bike and view its maintenance dashboard
- Built-in maintenance items/templates
- Schedule maintenance by:
  - **distance**
  - **time**
  - or both
- Log completed maintenance
- Preserve current maintenance state per bike/task

### Maintenance history

- Store maintenance history/log entries in the backend
- Show recent maintenance history in the UI
- Persist history across refresh and login/logout

### In-app status tracking

- **Overdue**
- **Due soon**
- **On Track**

## Tech stack

- **Frontend:** Vite + Vanilla TypeScript
- **Backend:** Node.js + TypeScript REST API (Express)
- **Database:** SQLite
- **Tests:** Playwright (planned / expanding next)

## Architecture

```text
/web  -> frontend client (Vite + TypeScript)
/api  -> backend REST API (Node + Express + TypeScript)
SQLite -> persistence layer
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
