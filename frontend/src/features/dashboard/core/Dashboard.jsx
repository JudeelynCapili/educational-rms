import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { DashboardSkeleton } from '../../../components/Skeleton/Skeleton';
import EditProfileModal from '../../../components/Profile/EditProfileModal';
import DashboardHeader from './DashboardHeader';
import WelcomeSection from './WelcomeSection';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import useInactivityLogout from '../../../hooks/useInactivityLogout';
import useDashboardData from '../../../hooks/booking/useDashboardData';
import ErrorMessage from '../../../components/Error/ErrorMessage';
import './styles/Dashboard.css';

const DashboardCards = lazy(() => import('../stats/DashboardCards'));
const RecentActivity = lazy(() => import('../activity/RecentActivity'));
const QuickActions = lazy(() => import('../actions/QuickActions'));
const AdminSchedulingStats = lazy(() => import('../admin/AdminSchedulingStats'));
const MiniCalendar = lazy(() => import('../calendar/MiniCalendar'));

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  useInactivityLogout(logout, navigate);
  const { dashboardData, loading, error, refreshDashboard } = useDashboardData(user, navigate);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async (updatedUser) => {
    // Refresh user data in the auth store
    // ...existing code...
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="dashboard">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const { user: userData, booking_stats, recent_bookings, simulation_stats, scheduling_stats } = dashboardData;
  const isAdmin = userData.role === 'ADMIN' || userData.role === 'FACULTY';

  return (
    <div className="dashboard">
      <DashboardHeader user={userData} onLogout={handleLogout} />

      <div className="dashboard-content">
        <WelcomeSection userName={userData.first_name || userData.username} />

        {isAdmin && (
          <div className="features-access-section">
            <button 
              className="features-cta-button"
              onClick={() => navigate('/features/overview')}
              title="View all 10 features with dedicated landing pages"
            >
              <span className="features-icon"><FiStar /></span>
              <span className="features-text">View All 10 Features</span>
              <span className="features-arrow"><FiArrowRight /></span>
            </button>
          </div>
        )}

        <Suspense fallback={<div className="loading">Loading dashboard sections...</div>}>
          <DashboardCards
            bookingStats={booking_stats}
            simulationStats={simulation_stats}
          />

          {/* Admin Scheduling Stats - Only for admins/faculty */}
          {isAdmin && scheduling_stats && (
            <AdminSchedulingStats
              schedulingStats={scheduling_stats}
              onBookingUpdate={refreshDashboard}
            />
          )}

          <div className="content-sections">
            {isAdmin ? (
              <>
                <MiniCalendar />
                <RecentActivity bookings={recent_bookings} />
              </>
            ) : (
              <RecentActivity bookings={recent_bookings} />
            )}

            <QuickActions
              onEditProfile={() => setIsEditProfileOpen(true)}
              userRole={userData.role}
              onBookingCreated={refreshDashboard}
            />
          </div>
        </Suspense>
      </div>

      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        onUpdate={handleProfileUpdate} 
      />
    </div>
  );
};

export default Dashboard;

