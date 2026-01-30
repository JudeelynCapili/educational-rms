import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/components/Login';
import Register from '../features/auth/components/Register';
import Dashboard from '../components/Dashboard/Dashboard';
import AdminScheduling from '../components/Admin/AdminScheduling/AdminScheduling';
import MainLayout from '../components/Layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';

// Feature Landing Pages
import RoomsLanding from '../pages/Features/RoomsLanding';
import EquipmentLanding from '../pages/Features/EquipmentLanding';
import BookingsLanding from '../pages/Features/BookingsLanding';
import CalendarLanding from '../pages/Features/CalendarLanding';
import ApprovalLanding from '../pages/Features/ApprovalLanding';
import RecurringLanding from '../pages/Features/RecurringLanding';
import ConflictOverrideLanding from '../pages/Features/ConflictOverrideLanding';
import WaitlistLanding from '../pages/Features/WaitlistLanding';
import DragDropLanding from '../pages/Features/DragDropLanding';

const AppRoutes = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-scheduling"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <AdminScheduling />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Feature Landing Pages */}
        <Route
          path="/features/rooms"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <RoomsLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/equipment"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <EquipmentLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/bookings"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <BookingsLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/calendar"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <CalendarLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/approval"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <ApprovalLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/recurring"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <RecurringLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/conflict-override"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <ConflictOverrideLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/waitlist"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <WaitlistLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/features/drag-drop"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <DragDropLanding />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
