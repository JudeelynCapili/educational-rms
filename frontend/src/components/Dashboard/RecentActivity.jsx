import React from 'react';
import './Dashboard.css';

const RecentActivity = ({ bookings }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      CONFIRMED: 'completed',
      PENDING: 'pending',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed'
    };
    return statusMap[status] || 'pending';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Recent Activity</h2>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="activity-list">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="activity-item">
              <div className="activity-header">
                <span className="activity-type">{booking.room_name}</span>
                <span className={`activity-status ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <p className="activity-date">{formatDate(booking.date)} at {booking.time}</p>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No Recent Activity</h3>
            <p className="empty-state-text">
              Your bookings and activities will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
