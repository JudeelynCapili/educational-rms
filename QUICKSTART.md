# Quick Start Guide

## Fastest Way to Get Started (5 minutes)

### Backend Startup

```bash
cd backend

# Create migrations (first time only)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create admin user (first time only)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

**Backend is now at**: http://localhost:8000
**Admin panel**: http://localhost:8000/admin

### Frontend Startup

```bash
cd frontend

# Install packages (first time only)
npm install

# Run dev server
npm run dev
```

**Frontend is now at**: http://localhost:5173

## Test the Login System

1. Go to http://localhost:5173
2. Click "Register here"
3. Fill in form with:
   - Username: testuser
   - Email: test@example.com
   - Password: Password123 (8+ chars)
   - Role: Select any role
4. Click Register
5. You should be redirected to dashboard

## Useful Commands

### Backend

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test

# Reset database (SQLite only)
rm db.sqlite3
python manage.py migrate
```

### Frontend

```bash
# Install packages
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/v1/auth/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## File Structure to Remember

```
Backend Models: backend/apps/{app_name}/models.py
Backend Views: backend/apps/{app_name}/views.py
Backend Serializers: backend/apps/{app_name}/serializers.py

Frontend Components: frontend/src/features/{feature_name}/components/
Frontend Hooks: frontend/src/hooks/
Frontend Services: frontend/src/services/
Frontend Stores: frontend/src/stores/
```

## Authentication Flow

1. **Register**: User provides email, password, role
2. **Backend**: Creates user, returns JWT tokens
3. **Frontend**: Stores tokens in localStorage
4. **API Calls**: Tokens sent in Authorization header
5. **Token Refresh**: Auto-refresh when token expires

## Key Features Implemented

✅ User Registration with role selection
✅ User Login with JWT authentication
✅ Protected routes (admin-only, authenticated-only)
✅ Token refresh mechanism
✅ Error handling and validation
✅ User profiles
✅ Room booking models
✅ Simulation configuration
✅ Analytics setup

## Next Steps to Build

1. **Scheduling Module**:
   - Calendar component
   - Booking form
   - Time slot picker

2. **Simulation Module**:
   - Parameter configuration
   - Results visualization
   - Report generation

3. **Analytics Dashboard**:
   - Charts and graphs
   - Usage statistics
   - Custom reports

4. **Admin Panel**:
   - User management
   - Resource allocation
   - System settings

---

**Questions?** Check SETUP_GUIDE.md for detailed instructions.
