# ✅ Setup Complete - Ready to Run!

Your database is **fully configured** with all tables created. You can now start the application.

## Start the Backend

Open a **new PowerShell terminal** and run:

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk\backend"
npm run dev
```

You should see:

```
✅ Server running on http://localhost:5000
📡 Dev frontend: http://localhost:5173
```

## Start the Frontend

Open **another PowerShell terminal** and run:

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk\frontend"
npm run dev
```

You should see:

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

## Access the App

- **From this PC:**  
  http://localhost:5173

- **From other PCs on your network:**  
  http://10.31.36.125:5173

---

## Troubleshooting

**If Backend won't start:**

- Check if port 5000 is in use
- Verify `.env` file has correct `DATABASE_URL`
- Try: `lsof -i :5000` or `netstat -ano | findstr :5000`

**If Frontend won't start:**

- Check if port 5173 is in use
- Clear `node_modules`: `rm -r node_modules && npm install`

**If database connection fails:**

- Verify PostgreSQL is running
- Check credentials in `backend/.env`
- Run: `psql -U ict_local_user -h 127.0.0.1 -d ict_support_local`

---

## What's Been Set Up

✅ PostgreSQL database `ict_support_local` created  
✅ User `ict_local_user` created with proper permissions  
✅ All 5 database migrations applied  
✅ Backend dependencies installed  
✅ Frontend dependencies installed  
✅ Environment variables configured

**Everything is ready to go! 🚀**
