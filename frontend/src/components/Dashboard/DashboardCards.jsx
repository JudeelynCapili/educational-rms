import React from 'react';
import './Dashboard.css';

const DashboardCards = ({ bookingStats, simulationStats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <p className="stat-label">Total Bookings</p>
          <div className="stat-icon">📅</div>
        </div>
        <p className="stat-value">{bookingStats.total_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change neutral">—</span>
          <span className="stat-period">All time</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <p className="stat-label">Confirmed</p>
          <div className="stat-icon">✓</div>
        </div>
        <p className="stat-value">{bookingStats.confirmed_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change positive">↑ Active</span>
          <span className="stat-period">Current</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <p className="stat-label">Pending</p>
          <div className="stat-icon">⏳</div>
        </div>
        <p className="stat-value">{bookingStats.pending_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change neutral">Awaiting</span>
          <span className="stat-period">Review</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <p className="stat-label">Simulations</p>
          <div className="stat-icon">⚙️</div>
        </div>
        <p className="stat-value">{simulationStats.total_simulations}</p>
        <div className="stat-footer">
          <span className="stat-change neutral">Runs</span>
          <span className="stat-period">Total</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
