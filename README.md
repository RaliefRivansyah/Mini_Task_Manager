# Mini Task Manager

A small full-stack task workflow application built for a technical take-home exercise. The backend is Node.js and Express with Sequelize/PostgreSQL; the frontend is React and Vite with Tailwind CSS.

## Project Structure

```text
Mini_Task_Manager/
├── Backend/
│   ├── src/
│   │   ├── config/                 # Environment and Sequelize CLI config
│   │   ├── controllers/            # HTTP request/response handlers
│   │   ├── database/
│   │   │   ├── migrations/         # Tasks, audit logs, and DB immutability trigger
│   │   │   ├── models/             # Sequelize models and associations
│   │   │   └── connection.js
│   │   ├── routes/
│   │   ├── services/               # Domain rules and transactions
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── App.jsx                 # Task manager screen and workflow controls
│   │   ├── api.js
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Setup

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

The database is available at `localhost:5432` with database/user/password `task_manager`.

### 2. Install and migrate the backend

```bash
cd Backend
copy .env.example .env
npm install
npm run db:migrate
npm run dev
```

The API runs at `http://localhost:3000`. Use `npm start` for a non-watch process.

### 3. Run the frontend

In a second terminal:

```bash
cd Frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. On macOS/Linux, use `cp .env.example .env` instead of `copy`.

## API

| Method | Endpoint                    | Purpose                                                            |
| ------ | --------------------------- | ------------------------------------------------------------------ |
| GET    | `/api/tasks`                | List tasks, newest first                                           |
| POST   | `/api/tasks`                | Create a task with `to_do` status                                  |
| PUT    | `/api/tasks/:id/status`     | Advance a task with `{ "status": "pending", "actor": "John Doe" }` |
| DELETE | `/api/tasks/:id`            | Delete a task                                                      |
| GET    | `/api/tasks/:id/audit-logs` | Read chronological immutable audit history                         |

## Architecture and Domain Rules

The controller layer stays thin and delegates domain decisions to `taskService.js`. `STATUSES` is the single ordered list used by the API to accept only the next status. The frontend mirrors that list for button labels, but backend validation is authoritative.

Status updates use one PostgreSQL transaction. The task row is locked with `FOR UPDATE`, then the status update and audit insert commit together. A repeated request for the task's current status returns the task without creating an audit row. A predefined actor list is validated server-side as well as selected in the UI.

Audit logs use UUID identifiers, are returned in ascending timestamp order, and cannot be changed through backend services. The migration also creates a PostgreSQL trigger that rejects both `UPDATE` and `DELETE`, protecting immutability even if a future code path bypasses the service layer. Deleting a task cascades its logs because the history has no meaning without its parent task.

## Scope Trade-offs

- JavaScript was chosen over TypeScript explicitly for rapid prototyping speed within the 3-5 hour take-home scope. The service boundary and API payloads are still kept small and explicit so a later TypeScript migration has clear seams.
- Sequelize migrations are used instead of `sync()` so schema changes are reviewable and reproducible.
- The UI uses a single focused screen rather than introducing routing, authentication, pagination, or a state-management library that the requirements do not need.
- The actor list is intentionally predefined and local. A production system would resolve actors from an authenticated identity service.
- Errors are presented as compact messages and `window.alert` for the narrow take-home workflow; a production UI would use a reusable notification system and structured form errors.

## Mandatory Evaluation Questions

### a) How do you ensure audit logs remain unmodified?

There are two layers. The service exposes only creation and reads; there are no update or delete operations for `AuditLog`. The database migration adds a PostgreSQL `BEFORE UPDATE OR DELETE` trigger which raises an exception for either mutation attempt. This database-level guard protects the invariant regardless of which backend path issues a query. Audit rows can be removed only indirectly when their parent task is deleted through the foreign key's `ON DELETE CASCADE` rule.

### b) Which part carries the highest risk under high user concurrency or scale?

The status transition is the highest-risk area because multiple users can try to advance the same task at once. The row lock and transaction prevent two requests from both reading the same old status and writing conflicting audit history. At higher throughput, this lock becomes a contention point and the single primary PostgreSQL instance becomes the likely bottleneck. The current design favors correctness and consistency over maximum write parallelism.

### c) If this grows into a production-scale system, what would you refactor first and why?

First, I would introduce authenticated users and a durable actor/user relationship, replacing the in-memory predefined actor list. Next, I would add request validation middleware, structured error codes, pagination, indexes for task listing and audit queries, and automated tests around concurrent transitions. At larger scale, I would separate audit ingestion from read models with an outbox/event approach while retaining a transactional source of truth, then add observability, rate limiting, and a connection pool strategy.

### d) How was AI used in this project, and how did you validate its output?

AI was used as a coding assistant to help scaffold the project structure, draft repetitive React/CSS and Sequelize wiring, and check the implementation against the stated domain rules. The output was treated as a draft: I reviewed the transaction boundary, row-lock behavior, idempotency, migration signatures, foreign keys, and trigger SQL manually. Validation included Node syntax checks, frontend production build checks, database migrations against the Docker PostgreSQL instance, and manual API/UI checks for legal transitions, rejected skips, audit ordering, and repeated same-status updates. In a production setting I would add automated unit, integration, and concurrency tests before relying on the implementation.

## Useful Commands

```bash
# Undo the latest migration
cd Backend && npm run db:migrate:undo

# Build the frontend for deployment
cd Frontend && npm run build

# Stop the database (data volume remains)
docker compose down
```
