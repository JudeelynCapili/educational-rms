# Educational RMS - Complete Setup & Build Guide

This guide will walk you through setting up and running the Educational Resource Management System with role-based authentication.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Vite)                  │
│  - Login/Register Pages                                     │
│  - Dashboard & Features                                     │
│  - State Management (Zustand)                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Django + DRF)                         │
│  ├── Authentication (JWT)                                   │
│  ├── User Management (Role-based)                           │
│  ├── Scheduling System                                      │
│  ├── Simulation Engine                                      │
│  └── Analytics                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ PostgreSQL
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  PostgreSQL Database                        │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
cd backend

# Install all required packages
pip install -r requirements.txt
```

### 1.2 Configure Database

#### Option A: SQLite (Development)
SQLite is already configured by default in `.env` for quick testing.

#### Option B: PostgreSQL (Production-like)

1. **Install PostgreSQL** (if not installed)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # In PostgreSQL console
   CREATE DATABASE educational_rms_db;
   CREATE USER rms_user WITH PASSWORD 'secure_password';
   ALTER ROLE rms_user SET client_encoding TO 'utf8';
   ALTER ROLE rms_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE rms_user SET default_transaction_deferrable TO on;
   GRANT ALL PRIVILEGES ON DATABASE educational_rms_db TO rms_user;
   \q
   ```

3. **Update `.env` file**
   ```
   DEBUG=True
   DATABASE_URL=postgresql://rms_user:secure_password@localhost:5432/educational_rms_db
   ```

### 1.3 Create Migrations

```bash
# Create initial migrations for all apps
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### 1.4 Create Admin User

```bash
# Create a superuser account
python manage.py createsuperuser

# Follow prompts:
# Username: admin
# Email: admin@example.com
# Password: (set a secure password)
```

### 1.5 Create Sample Data (Optional)

```bash
# Create sample rooms for scheduling
python manage.py shell

# Inside Django shell:
from apps.scheduling.models import Room

rooms_data = [
    {'name': 'Lab A101', 'capacity': 30, 'location': 'Building A, 1st Floor', 'equipment': 'Computers, Projector'},
    {'name': 'Lab B202', 'capacity': 25, 'location': 'Building B, 2nd Floor', 'equipment': 'Workstations, Whiteboard'},
    {'name': 'Lab C303', 'capacity': 40, 'location': 'Building C, 3rd Floor', 'equipment': 'Advanced Computers'},
]

for room in rooms_data:
    Room.objects.create(**room)

exit()
```

### 1.6 Run Backend Server

```bash
# Start Django development server
python manage.py runserver

# Server will be available at: http://localhost:8000
# Admin panel at: http://localhost:8000/admin
```

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend

# Install Node packages
npm install
```

### 2.2 Configure Environment Variables

Check/update `.env` file:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### 2.3 Run Frontend Development Server

```bash
# Start Vite dev server
npm run dev

# Server will be available at: http://localhost:5173
```

## Step 3: Testing Authentication

### 3.1 Test Using Admin Panel

1. Navigate to: http://localhost:8000/admin
2. Login with superuser credentials (created in Step 1.4)
3. You can manage users, rooms, and bookings here

### 3.2 Test Using Frontend

1. Navigate to: http://localhost:5173/login
2. Click "Register here" to create a new account
3. Fill in the registration form:
   - **Username**: Choose any username
   - **Email**: Any valid email
   - **Password**: At least 8 characters
   - **First/Last Name**: Your name
   - **Role**: Select Student, Faculty, or Admin
   - **Department**: Optional

4. After registration, you'll be redirected to the dashboard

### 3.3 Test Role-Based Access

#### Admin Role:
- Can view all bookings and users
- Can manage system resources
- Access admin functions

#### Faculty Role:
- Can create and manage own bookings
- Can access analytics
- Limited user management

#### Student Role:
- Can create bookings
- Can view availability
- Limited access to analytics

## API Endpoints

### Authentication Endpoints

```
POST   /api/v1/auth/users/register/        - Register new user
POST   /api/v1/auth/users/login/           - Login user (returns JWT tokens)
POST   /api/v1/auth/users/logout/          - Logout user
GET    /api/v1/auth/users/me/              - Get current user
POST   /api/v1/auth/users/change_password/ - Change password
POST   /api/v1/auth/users/refresh_token/   - Refresh access token
GET    /api/v1/auth/users/roles/           - Get available roles
```

### User Profile Endpoints

```
GET    /api/v1/auth/profiles/me/           - Get current profile
PUT    /api/v1/auth/profiles/me/           - Update profile
PATCH  /api/v1/auth/profiles/me/           - Partial update
```

### Room Management Endpoints

```
GET    /api/v1/scheduling/rooms/           - List all rooms
POST   /api/v1/scheduling/rooms/           - Create new room (admin)
GET    /api/v1/scheduling/rooms/{id}/      - Get room details
PUT    /api/v1/scheduling/rooms/{id}/      - Update room (admin)
DELETE /api/v1/scheduling/rooms/{id}/      - Delete room (admin)
```

### Booking Endpoints

```
GET    /api/v1/scheduling/bookings/        - List bookings (filtered by user role)
POST   /api/v1/scheduling/bookings/        - Create new booking
GET    /api/v1/scheduling/bookings/{id}/   - Get booking details
PUT    /api/v1/scheduling/bookings/{id}/   - Update booking
DELETE /api/v1/scheduling/bookings/{id}/   - Cancel booking
POST   /api/v1/scheduling/bookings/{id}/confirm/ - Confirm booking
POST   /api/v1/scheduling/bookings/{id}/cancel/  - Cancel booking
```

### Simulation Endpoints

```
GET    /api/v1/simulation/                 - List simulations
POST   /api/v1/simulation/                 - Create simulation config
GET    /api/v1/simulation/{id}/            - Get config details
POST   /api/v1/simulation/{id}/run/        - Run simulation
GET    /api/v1/simulation/{id}/results/    - Get results
```

## Project Structure

```
educational-rms/
├── backend/
│   ├── apps/
│   │   ├── users/              # User authentication & profiles
│   │   ├── scheduling/         # Room booking system
│   │   ├── simulation/         # Simulation engine
│   │   └── analytics/          # Performance metrics
│   ├── api/                    # API configuration
│   ├── config/                 # Django settings
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── scheduling/     # Booking interface
│   │   │   └── simulation/     # Simulation UI
│   │   ├── components/         # Shared components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   ├── stores/             # State management
│   │   └── routes/             # Routing
│   ├── package.json
│   └── .env
│
└── README.md
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- Resource management
- Can view all bookings and analytics

### Faculty
- Create and manage own bookings
- Access scheduling calendar
- View analytics
- Manage courses

### Student
- Create bookings for available rooms
- View own bookings
- Limited analytics access
- Check availability

## Development Workflow

### Adding a New Feature

1. **Backend**:
   ```bash
   # 1. Create models in apps/{app_name}/models.py
   # 2. Create serializers in apps/{app_name}/serializers.py
   # 3. Create views in apps/{app_name}/views.py
   # 4. Create migrations and migrate
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Frontend**:
   ```bash
   # 1. Create API service in src/services/
   # 2. Create custom hook in src/hooks/
   # 3. Create component in src/features/{feature_name}/components/
   # 4. Add routes in src/routes/AppRoutes.jsx
   ```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'rest_framework_simplejwt'`
```bash
pip install djangorestframework-simplejwt
```

**Problem**: Database connection error
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in .env
# Run migrations: python manage.py migrate
```

### Frontend Issues

**Problem**: `Cannot find module 'axios'`
```bash
npm install axios
```

**Problem**: CORS error when calling API
```bash
# Check CORS_ALLOWED_ORIGINS in backend .env
# Add frontend URL if missing
```

## Next Steps

1. **Implement Scheduling Features**:
   - Calendar view component
   - Booking form with conflict detection
   - Time slot management

2. **Implement Simulation Features**:
   - Parameter configuration UI
   - Results visualization
   - Scenario builder

3. **Add Analytics Dashboard**:
   - Utilization charts
   - Performance metrics
   - Custom reports

4. **Deployment**:
   - Docker containerization
   - Cloud deployment (AWS, Heroku, Vercel)
   - Database optimization

## Additional Resources

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

## Support

For issues or questions, refer to the troubleshooting section or check the documentation in each component.
