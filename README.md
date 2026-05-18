# ICT Support Desk

Project: A lightweight support desk web application with separate backend and frontend.

**Overview**
- **Backend:** Node.js + Express server located in `backend/` using Prisma for database access and migrations. Server entry: `backend/server.js`.
- **Frontend:** Vite + React app located in `frontend/` with pages for users, agents, and admins and components in `frontend/src/components/`.

**Backend (brief)**
- API routes: `backend/routes/` (`agents.js`, `auth.js`, `messages.js`, `tickets.js`).
- ORM: Prisma with schema in `backend/prisma/schema.prisma` and migrations in `backend/prisma/migrations/`.
- Note: seed data exists in `backend/seed.js` for local development; its contents are intentionally not included in this README or elsewhere in the repository.

**Frontend (brief)**
- Built with React and Vite. Main entry: `frontend/src/main.jsx`. Key pages in `frontend/src/pages/`.
- Socket support: `frontend/src/socket.js`.

**Setup**
Prerequisites: Node.js (16+), npm or yarn, a Postgres/SQLite DB per Prisma configuration.

1. Install dependencies (backend and frontend):

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Environment variables
- Create a `.env` for `backend/` with your `DATABASE_URL` and any auth secrets. Do not commit `.env`.

3. Database
- Run Prisma migrations from `backend/`:

```bash
cd backend
npx prisma migrate deploy
```


**Run**
- Start backend:

```bash
cd backend
npm run dev
```

- Start frontend (development):

```bash
cd frontend
npm run dev
```

**Notes & Security**
- Do not paste or commit the contents of `backend/seed.js` into issue trackers, chat, or public READMEs.
- Keep `.env` and any API keys out of version control.

**Files added**
- `.gitignore` files were added at repository root and inside `backend/` and `frontend/` to prevent sensitive or large files from being tracked.

