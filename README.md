# Fullstack Template: MySQL + Node.js/Express + React + Agent Orchestrator

A ready-to-run starter template. Clone, configure a `.env`, run two `npm` commands, and you have:

- A MySQL-backed REST API with JWT authentication (three-table model: `user_profile`, `user_login`, `user_account`).
- A CRUD demo resource (`items`) you can copy to build your own entities.
- A provider-agnostic **Agent Orchestrator** with a tool registry (includes a `MockProvider` so it runs offline).
- A Vite + React SPA with protected routes, an auth context, an items CRUD page, and an agent chat page.
- Structured request and action logging across every layer.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Ships with Node |
| MySQL | 8.x | Or Docker Desktop, which `docker-compose.yml` uses |
| Git | any | Optional but useful |

Check your machine:

```powershell
node --version
npm --version
docker --version   # only needed if you use the bundled MySQL
```

---

## 2. Project layout

```
.
|-- docker-compose.yml     # MySQL 8 (optional, for local dev)
|-- README.md              # this file
|-- smoke-test.ps1         # end-to-end API smoke test
|-- backend/               # Express + Sequelize API
|   |-- .env.example
|   `-- src/
|       |-- server.js            # bootstrap (authenticate + sync + listen)
|       |-- app.js               # express wiring (cors, json, logger, routes)
|       |-- config/db.js         # Sequelize connection
|       |-- models/              # UserProfile, UserLogin, UserAccount, Item
|       |-- middleware/          # authMiddleware, errorHandler, requestLogger
|       |-- utils/               # jwt, password, logger
|       |-- services/            # business logic (auth, items)
|       |-- controllers/         # HTTP handlers
|       |-- routes/              # /api/auth, /api/users, /api/items, /api/agent
|       `-- agent/               # orchestrator, providers, tools
`-- frontend/              # Vite + React SPA
    |-- .env.example
    `-- src/
        |-- main.jsx, App.jsx
        |-- api/                 # axios client, auth/items/agent helpers
        |-- context/             # AuthContext
        |-- components/          # Navbar, ProtectedRoute
        |-- pages/               # Login, Register, Dashboard, Items, Agent
        `-- styles/index.css
```

---

## 3. Setup: one time

### 3.1. Clone / copy the template into your workspace

```powershell
# already in c:\tmp_nodejs_llm_react\ for this template
```

### 3.2. Copy env files

```powershell
Copy-Item backend\.env.example  backend\.env  -Force
Copy-Item frontend\.env.example frontend\.env -Force
```

Open `backend\.env` and at minimum set a strong `JWT_SECRET`. Defaults for MySQL match `docker-compose.yml`.

```
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=app_db

JWT_SECRET=<long random string>
JWT_EXPIRES_IN=1d

AGENT_PROVIDER=mock
```

`frontend\.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3.3. Start MySQL

Option A - bundled Docker service (recommended):

```powershell
docker compose up -d mysql
```

Option B - use any local MySQL 8 and update `backend\.env` accordingly. Create a database named `app_db`:

```sql
CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL ON app_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

### 3.4. Install dependencies

```powershell
cd backend;  npm install
cd ..\frontend; npm install
cd ..
```

---

## 4. Run the app

Open two PowerShell windows.

**Window 1 - backend**

```powershell
cd backend
npm run dev        # hot reload via nodemon (or 'npm start' for plain node)
```

First start auto-creates the tables via `sequelize.sync({ alter: true })`. You should see:

```
[INFO] [server] starting {"port":4000,"env":"development"}
[INFO] [server] db connection established
[INFO] [server] models synchronized
[INFO] [server] api listening {"url":"http://localhost:4000"}
```

**Window 2 - frontend**

```powershell
cd frontend
npm run dev
```

Vite prints `http://127.0.0.1:5173/`. Open it in a browser.

### Sanity check

```powershell
Invoke-RestMethod http://localhost:4000/health
# { status = ok; uptime = ... }
```

Run the end-to-end smoke test that exercises register, login, me, items CRUD, agent chat, and an auth-required 401:

```powershell
powershell -ExecutionPolicy Bypass -File .\smoke-test.ps1
```

---

## 5. Using the template

### 5.1. Register and sign in (SPA)

1. Open `http://localhost:5173/register`.
2. Fill in full name, email, username, password (min 6 chars).
3. You land on the **Dashboard** with `user_profile`, `user_login`, and `user_account` values.
4. `Logout` clears the token and returns you to `/login`.

### 5.2. Manage items (CRUD demo)

Go to **Items**. Use the form to create, then `Edit`/`Delete` rows. All queries are owner-scoped by `user_profile_id`.

### 5.3. Talk to the agent

Go to **Agent**. Ask:

```
list my items please
```

The `MockProvider` emits a tool call, the orchestrator runs `items.list`, then the provider produces a final summary. The yellow message in the chat is the tool trace; the white one is the assistant's answer.

### 5.4. Using the API directly

```powershell
$reg = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/auth/register `
  -ContentType application/json `
  -Body (@{ fullName='Bob'; email='bob@x.io'; username='bob'; password='secret123' } | ConvertTo-Json)

$token = $reg.token
$H = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri http://localhost:4000/api/auth/me -Headers $H
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/items -Headers $H `
  -ContentType application/json -Body (@{ name='hello' } | ConvertTo-Json)
```

### 5.5. API reference

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/health` | no | - | Liveness |
| POST | `/api/auth/register` | no | `{ fullName, email, username, password }` | Create profile + login + account |
| POST | `/api/auth/login` | no | `{ username, password }` | Returns `{ token, user }` |
| GET | `/api/auth/me` | yes | - | Current user incl. `login`, `account` |
| GET | `/api/users` | yes | - | Demo listing (gate by `role=admin` in prod) |
| GET | `/api/items` | yes | - | Owner-scoped list |
| POST | `/api/items` | yes | `{ name, description? }` | Create |
| GET | `/api/items/:id` | yes | - | Get one |
| PUT | `/api/items/:id` | yes | `{ name?, description? }` | Update |
| DELETE | `/api/items/:id` | yes | - | Delete |
| POST | `/api/agent/chat` | yes | `{ message, history? }` | Run orchestrator, returns `{ message, trace, messages }` |

---

## 6. Extending the template

### 6.1. Add a new resource (CRUD)

1. Create a model in `backend/src/models/YourModel.js`, register it in `models/index.js` (and add an association if it belongs to a user).
2. Copy `services/itemService.js` to `services/yourService.js` and adjust fields.
3. Copy `controllers/itemController.js` and `routes/itemRoutes.js`.
4. Mount the new router in `routes/index.js`:

```js
router.use('/things', require('./thingRoutes'));
```

5. On the frontend, create `src/api/things.js` (mirror `items.js`) and a page under `src/pages/`. Add a route in `App.jsx`.

Restart the backend; `sequelize.sync({ alter: true })` creates the new table automatically.

### 6.2. Plug a real LLM into the Agent Orchestrator

Every provider implements:

```js
// backend/src/agent/providers/BaseProvider.js
async chat({ messages, tools }) {
  // return { content: string, toolCalls: [{ name, arguments? }, ...] }
}
```

1. Create `backend/src/agent/providers/OpenAIProvider.js` (or any vendor) that extends `BaseProvider`, maps `tools` to the vendor's function-calling schema, and converts the response back into `{ content, toolCalls }`.
2. Register it in `backend/src/agent/orchestrator.js` inside `buildDefaultProvider()`:

```js
case 'openai':      return new OpenAIProvider();
case 'huggingface': return new HuggingFaceProvider();
```

3. Set `AGENT_PROVIDER=openai` (and any vendor keys such as `OPENAI_API_KEY`) in `backend/.env` and restart.

### 6.3. Add a new agent tool

1. Create `backend/src/agent/tools/myTool.js`:

```js
module.exports.myTool = {
  name: 'my.tool',
  description: 'What this tool does',
  parameters: { type: 'object', properties: { /* JSON schema */ } },
  async handler(args, ctx) {
    // ctx.profileId and ctx.username are populated by the agent controller
    return { ok: true };
  },
};
```

2. Add it to the `tools` array in `backend/src/agent/tools/index.js`.

Any LLM provider that supports tool-calling can now invoke it.

---

## 7. Logging

Every action emits structured logs with ISO timestamps, a level, a scope, and JSON metadata:

```
2026-04-28T11:28:51.046Z [INFO] [agent] run start {"username":"alice","profileId":2,"tools":["items.list"]}
2026-04-28T11:28:51.050Z [INFO] [agent] tool ok {"name":"items.list","durationMs":3}
2026-04-28T11:28:51.051Z [INFO] [http] <- response {"id":"99...","method":"POST","url":"/api/agent/chat","status":200,"durationMs":7.06,"user":"alice"}
```

Scopes in use: `server`, `http`, `sql`, `auth`, `auth:jwt`, `items`, `agent`, `error`.

Control verbosity with `LOG_LEVEL` in `backend/.env`:

| Value | Emits |
|---|---|
| `debug` | Everything incl. SQL and per-iteration agent details |
| `info` (default) | Requests, responses, action outcomes |
| `warn` | Only warnings and errors |
| `error` | Errors only |

Every request is tagged with an `X-Request-Id` response header that matches the `id` field in log lines, so you can trace a single request through `http`, service, and SQL logs.

---

## 8. Troubleshooting

| Symptom | Check |
|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL isn't up. Run `docker compose up -d mysql` or start your local MySQL |
| `Access denied for user` | `DB_USER` / `DB_PASSWORD` in `backend/.env` don't match your MySQL |
| `JWT_SECRET is not set` | Set `JWT_SECRET` in `backend/.env` and restart |
| 401 on every API call from the SPA | Token expired or missing - log out and log back in |
| CORS error in the browser | `CORS_ORIGIN` in `backend/.env` must match the Vite origin (default `http://localhost:5173`) |
| Port 4000 or 5173 busy | Change `PORT` in `backend/.env` or `vite.config.js` |
| Schema drift after model changes | Restart the backend; `sequelize.sync({ alter: true })` reconciles columns |

Stop the bundled MySQL when you're done:

```powershell
docker compose down           # keep data
docker compose down -v        # wipe data volume
```

---

## 9. Next steps for production

- Replace `sequelize.sync` with migrations (`sequelize-cli` or `umzug`).
- Move tokens to httpOnly cookies and add refresh-token rotation.
- Add role-based guards (`req.user.role === 'admin'`) on admin endpoints.
- Add input validation (`zod`, `joi`, or `express-validator`).
- Add automated tests (`vitest` for the SPA, `node --test` or `jest` for the API).
- Containerize backend and frontend; extend `docker-compose.yml` for deployment.
- Ship logs to a collector (Loki, ELK, Datadog) instead of stdout.

Happy building.
