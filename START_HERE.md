# 🚀 HOW TO START THE SYSTEM (Step-by-Step)

## Prerequisites Check ✅

Before starting, make sure you have:
- Python 3.10+ (`python --version`)
- Node.js 16+ (`node --version`)
- PostgreSQL OR using SQLite
- All packages installed

---

## Method 1: Quick Start (Recommended)

### Step 1: Backend Setup (First Time Only)

```bash
# Navigate to backend
cd backend

# Run migrations (creates database tables)
python manage.py migrate

# Create admin user (follow prompts)
python manage.py createsuperuser

# Test backend starts
python manage.py runserver
```

✅ Backend will be at: http://localhost:8000
✅ Admin panel at: http://localhost:8000/admin

Press `Ctrl+C` to stop.

### Step 2: Frontend Setup (First Time Only)

```bash
# In NEW terminal, navigate to frontend
cd frontend

# Install Node packages
npm install

# Start frontend dev server
npm run dev
```

✅ Frontend will be at: http://localhost:5173

---

## Method 2: Subsequent Runs (After First Setup)

### Start Backend

```bash
cd backend
python manage.py runserver
```

### Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

---

## What to Do After Starting

### 1. Test Registration

1. Open browser: http://localhost:5173
2. Click "Register here"
3. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Password Confirm: `TestPassword123`
   - First Name: `Test`
   - Last Name: `User`
   - Role: `Student`
   - Department: `CS` (optional)
4. Click "Register"
5. Should redirect to dashboard

### 2. Test Login

1. From dashboard, look for logout option or navigate to: http://localhost:5173/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123`
3. Click "Login"
4. Should see dashboard

### 3. Test Admin Panel

1. Go to: http://localhost:8000/admin
2. Login with superuser (created in Step 1)
3. Browse Users, Rooms, Bookings

---

## Troubleshooting

### Backend Issues

**"Address already in use" error**
```bash
# Port 8000 is taken. Either:
# Option 1: Kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Option 2: Use different port
python manage.py runserver 8001
```

**"ModuleNotFoundError" errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Database errors**
```bash
# Reset database (SQLite only)
rm db.sqlite3
python manage.py migrate
```

### Frontend Issues

**"npm: command not found"**
```bash
# Install Node.js from: https://nodejs.org/
# Then run: npm install
```

**"Port 5173 already in use"**
```bash
# Kill process using port 5173 or use:
npm run dev -- --port 5174
```

**"Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Connection Issues

**"Cannot connect to API"**
1. Check backend is running: http://localhost:8000
2. Check VITE_API_URL in frontend/.env
3. Check CORS_ALLOWED_ORIGINS in backend/.env
4. Both should include localhost URLs

---

## File Structure Reminder

```
educational-rms/
├── backend/           ← Python/Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── apps/
│       ├── users/
│       ├── scheduling/
│       └── simulation/
│
├── frontend/          ← React/Vite
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── features/
│       ├── components/
│       └── services/
│
└── docs/              ← Documentation
```

---

## Environment Files

### Backend (.env)
Located at: `backend/.env`
```
DEBUG=True
SECRET_KEY=django-insecure-...
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
Located at: `frontend/.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Terminal Commands Summary

### Backend Terminal
```bash
cd backend                          # Go to backend folder
python manage.py migrate            # Setup database (first time)
python manage.py createsuperuser    # Create admin user (first time)
python manage.py runserver          # Start server
python manage.py shell              # Django shell
python manage.py test               # Run tests
```

### Frontend Terminal
```bash
cd frontend                         # Go to frontend folder
npm install                         # Install packages (first time)
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run lint                        # Check code quality
```

---

## Accessing the System

### After Starting Both Servers

| URL | Purpose | Default Login |
|-----|---------|---------------|
| http://localhost:5173 | Frontend (React App) | Register new account |
| http://localhost:8000 | Backend API Root | N/A (API only) |
| http://localhost:8000/admin | Django Admin | Superuser account |
| http://localhost:8000/api/v1 | API v1 Endpoints | JWT Token Required |

---

## API Quick Test

### Test Endpoints with curl

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123",
    "password_confirm": "TestPassword123",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }'

# Login user
curl -X POST http://localhost:8000/api/v1/auth/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Use returned access token to call protected endpoint
curl -X GET http://localhost:8000/api/v1/auth/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Docker Setup (Optional)

If you want to use Docker for PostgreSQL:

```bash
# Start PostgreSQL in Docker
docker run --name rms-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=educational_rms_db \
  -p 5432:5432 \
  -d postgres:15

# Update backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/educational_rms_db

# Run migrations
python manage.py migrate

# Start backend
python manage.py runserver
```

---

## Stopping the Servers

### Backend
Press `Ctrl+C` in backend terminal

### Frontend
Press `Ctrl+C` in frontend terminal

### Kill stuck processes
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9      # Kill port 8000
lsof -ti:5173 | xargs kill -9      # Kill port 5173

# Windows PowerShell
Get-Process | Where-Object {$_.Port -eq 8000} | Stop-Process
```

---

## First Time Setup Summary

```
1. cd backend
2. python manage.py migrate
3. python manage.py createsuperuser (enter credentials)
4. python manage.py runserver
5. (New terminal) cd frontend
6. npm install
7. npm run dev
8. Open http://localhost:5173
9. Click "Register"
10. Fill form and submit
11. ✅ You're logged in!
```

---

## Common Issues Checklist

- [ ] Backend won't start? → Check if port 8000 is free
- [ ] Frontend won't start? → Check if port 5173 is free
- [ ] Can't login? → Check both servers are running
- [ ] API returns 401? → Check if token is valid
- [ ] Registration fails? → Check error message in console
- [ ] Styling looks wrong? → Clear browser cache (Ctrl+Shift+Delete)

---

## Next Steps

After successful startup:

1. ✅ Test registration and login
2. ✅ Explore the admin panel
3. ✅ Review QUICKSTART.md
4. ✅ Read ARCHITECTURE.md
5. ✅ Plan Phase 2 features

---

## Need Help?

### Check These Files:
1. **QUICKSTART.md** - Quick reference
2. **SETUP_GUIDE.md** - Detailed setup
3. **README.md** - Project overview
4. **BUILD_SUMMARY.md** - What was built

### Check Terminal Output:
- Backend errors will show in backend terminal
- Frontend errors will show in frontend terminal
- Open browser console (F12) for frontend errors

### Check Logs:
- Django admin at http://localhost:8000/admin
- Browser DevTools (F12) for frontend
- Terminal output for errors

---

## Success Indicators

✅ **Backend Ready When You See:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C
```

✅ **Frontend Ready When You See:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Login Works When:**
- You can register with an email
- You can login with that email
- Dashboard page loads
- No red error messages

---

**You're all set! 🎉**

Enjoy the Educational RMS system!

For questions, check the documentation files in the root directory.
