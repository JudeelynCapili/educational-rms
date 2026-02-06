import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiHome, FiWatch, FiList, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import QuickBookingApproval from './QuickBookingApproval';
import './Dashboard.css';

const AdminSchedulingStats = ({ schedulingStats, onBookingUpdate }) => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(schedulingStats?.pending_requests || []);

  if (!schedulingStats) return null;

  const handleBookingApproved = (bookingId) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== bookingId));
    if (onBookingUpdate) onBookingUpdate();
  };

  const handleBookingRejected = (bookingId) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== bookingId));
    if (onBookingUpdate) onBookingUpdate();
  };

  return (
    <div className="admin-scheduling-section">
      <div className="section-header">
        <h2 className="section-title">Scheduling Management</h2>
        <button 
          className="view-all-btn"
          onClick={() => navigate('/admin-scheduling')}
        >
          Manage All
        </button>
      </div>

      {/* Scheduling Stats Cards */}
      <div className="scheduling-stats-grid">
        <div className="scheduling-stat-card pending">
          <div className="stat-icon-large"><FiClock size={32} color="#f59e0b" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.pending_approvals}</p>
            <p className="stat-label">Pending Approvals</p>
          </div>
        </div>

        <div className="scheduling-stat-card">
          <div className="stat-icon-large"><FiHome size={32} color="#3b82f6" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.total_rooms}</p>
            <p className="stat-label">Active Rooms</p>
          </div>
        </div>

        <div className="scheduling-stat-card">
          <div className="stat-icon-large"><FiWatch size={32} color="#8b5cf6" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.active_time_slots}</p>
            <p className="stat-label">Time Slots</p>
          </div>
        </div>

        <div className="scheduling-stat-card">
          <div className="stat-icon-large"><FiList size={32} color="#06b6d4" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.waitlist_entries}</p>
            <p className="stat-label">Waitlist Entries</p>
          </div>
        </div>

        <div className="scheduling-stat-card">
          <div className="stat-icon-large"><FiCalendar size={32} color="#10b981" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.upcoming_bookings}</p>
            <p className="stat-label">Upcoming (7 Days)</p>
          </div>
        </div>

        <div className="scheduling-stat-card warning">
          <div className="stat-icon-large"><FiAlertTriangle size={32} color="#ef4444" /></div>
          <div className="stat-info">
            <p className="stat-value">{schedulingStats.conflicts_today}</p>
            <p className="stat-label">Conflicts Today</p>
          </div>
        </div>
      </div>

      {/* Pending Requests with Quick Actions */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="pending-requests-section">
          <h3 className="subsection-title">Pending Approval Requests</h3>
          <div className="pending-requests-list">
            {pendingRequests.map((request) => (
              <QuickBookingApproval
                key={request.id}
                booking={request}
                onApproved={handleBookingApproved}
                onRejected={handleBookingRejected}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulingStats;
