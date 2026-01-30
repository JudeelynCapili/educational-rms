import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickCreateBooking from './QuickCreateBooking';
import './Dashboard.css';

const QuickActions = ({ onEditProfile, userRole, onBookingCreated }) => {
  const navigate = useNavigate();
  const isAdmin = userRole === 'ADMIN' || userRole === 'FACULTY';
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  const handleBookingCreated = () => {
    setShowCreateBooking(false);
    if (onBookingCreated) onBookingCreated();
  };

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button 
            className="action-btn"
            onClick={() => setShowCreateBooking(true)}
          >
            <div className="action-icon">📅</div>
            <div className="action-text">
              <div className="action-title">New Booking</div>
              <div className="action-description">Reserve a resource</div>
            </div>
          </button>
        <button className="action-btn">
          <div className="action-icon">📊</div>
          <div className="action-text">
            <div className="action-title">Run Simulation</div>
            <div className="action-description">Analyze usage patterns</div>
          </div>
        </button>
        <button className="action-btn" onClick={onEditProfile}>
          <div className="action-icon">👤</div>
          <div className="action-text">
            <div className="action-title">Edit Profile</div>
            <div className="action-description">Update your information</div>
          </div>
        </button>
        {isAdmin && (
          <button 
            className="action-btn admin-action" 
            onClick={() => navigate('/admin-scheduling')}
          >
            <div className="action-icon">⚙️</div>
            <div className="action-text">
              <div className="action-title">Admin Scheduling</div>
              <div className="action-description">Manage resources & bookings</div>
            </div>
          </button>
        )}
      </div>
    </div>

    {showCreateBooking && (
      <QuickCreateBooking
        onCreated={handleBookingCreated}
        onClose={() => setShowCreateBooking(false)}
      />
    )}
  </>
  );
};

export default QuickActions;
