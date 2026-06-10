# ICT Support Desk

A lightweight support desk web application with separate backend and frontend, featuring real-time chat, push notifications, and agent dashboard.

**Now with hybrid deployment:** Run online via Vercel + Render, or locally on your office network with automatic database sync!

## Overview

- **Backend:** Node.js + Express server located in `backend/` using Prisma ORM for database management. Server entry: `backend/server.js`.
- **Frontend:** Vite + React app located in `frontend/` with pages for users, agents, and admins. Key components in `frontend/src/components/`.
- **Real-time:** Socket.io integration for real-time notifications and chat messaging.
- **Notifications:** Firebase Cloud Messaging for push notifications and Cloudinary for image hosting.
- **Hybrid Deployment:** Runs online (Vercel/Render/Neon) AND locally on office network with automatic sync.

## Deployment Options

### 🌐 Online (Production)

- Frontend: Vercel
- Backend: Render/Railway
- Database: Neon PostgreSQL
- Access: Your custom domain

### 🏠 Local Network (New!)

- Run on office PC
- Access via `ict.local` or local IP
- All staff on same Wi-Fi can use it
- Works offline, syncs when internet returns
- **Setup:** See [QUICK_START_LOCAL.md](QUICK_START_LOCAL.md) (5 minutes)

## Quick Start

### Prerequisites

- Node.js 16+ with npm or yarn
- PostgreSQL or SQLite database
- Firebase project (optional, for push notifications)
- Cloudinary account (optional, for image hosting)

### Installation

1. **Backend Setup**

```bash
cd backend
npm install
```

2. **Frontend Setup**

```bash
cd frontend
npm install
```

### Environment Configuration

**Backend** - Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

# DEVELOPMENT DATABASE (Local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/ict_support_desk

# PRODUCTION DATABASE (Neon Cloud)
# Get from: Neon Dashboard → Connection String
NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require

# Other Configuration
JWT_SECRET=your-secret-key-here
CLIENT_URLS=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_JSON=./firebase-service-account.json
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** - Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_VAPID_KEY=your_public_vapid_key
```

See `backend/.env.example` and `frontend/.env.example` for all available options.

### Database Setup

```bash
cd backend
npx prisma migrate deploy
```

### Running Locally

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
backend/
├── routes/              # API routes (auth, tickets, messages, etc.)
├── middleware/          # Authentication & authorization
├── prisma/              # Database schema & migrations
├── utils/               # Helper functions (Firebase, Cloudinary)
└── server.js           # Express server entry point

frontend/
├── src/
│   ├── pages/          # Full page components
│   ├── components/     # Reusable UI components
│   ├── context/        # React contexts (Auth, Theme)
│   ├── api.js          # API client
│   ├── socket.js       # Socket.io client
│   └── firebase.js     # Firebase setup
├── public/             # Static assets
└── index.html          # HTML entry point
```

## Key Features

- **User Tickets:** Submit support requests with images, priority, and department info
- **Agent Dashboard:** Real-time ticket management with chat and status updates
- **Admin Panel:** Manage agents and view all tickets
- **Real-time Chat:** Socket.io powered messaging between users and agents
- **Push Notifications:** Firebase Cloud Messaging for system and browser notifications
- **Image Hosting:** Cloudinary integration for uploading and serving images
- **Dark Mode:** Complete dark/light theme support
- **Responsive Design:** Works on desktop, tablet, and mobile devices

## Production Deployment

For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Quick deployment options:

- **Backend:** Render, Heroku, Railway
- **Frontend:** Vercel, Netlify
- **Database:** PostgreSQL on AWS RDS, Google Cloud SQL, or managed service

## Security Notes

- ⚠️ **Never commit `.env` files** - they contain sensitive credentials
- Firebase service account JSON is in `.gitignore` for security
- All environment variables should be set via hosting platform configuration
- JWT_SECRET must be a long, random string in production
- CORS is configured to restrict requests to authorized domains

## API Routes

### Authentication

- `POST /api/auth/register-user` - Register user
- `POST /api/auth/login-user` - User login
- `POST /api/auth/login-agent` - Agent login
- `POST /api/auth/login-admin` - Admin login

### Tickets

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket

### Messages

- `GET /api/messages/:ticketId` - Get chat messages
- `POST /api/messages/:ticketId/user` - Send user message
- `POST /api/messages/:ticketId/agent` - Send agent message

### Notifications

- `GET /api/notifications/tokens` - Get notification tokens
- `POST /api/notifications/tokens` - Register notification token
- `DELETE /api/notifications/tokens` - Unregister token

## Troubleshooting

### Socket Connection Issues

- Ensure `VITE_SOCKET_URL` matches your backend URL
- Check that Socket.io is enabled on your hosting
- Verify CORS configuration allows your frontend domain

### Push Notifications Not Working

- Verify Firebase configuration in `.env`
- Ensure service worker is registered in browser
- Check browser notification permissions
- Look for errors in browser console

### Database Connection Errors

- Verify `DATABASE_URL` is correct and accessible (local PostgreSQL or Neon connection string)
- Check database credentials and host
- Ensure PostgreSQL is running locally
- Run migrations: `npx prisma migrate deploy`

## License

Private project

## Support

For issues or improvements, please contact the development team.
