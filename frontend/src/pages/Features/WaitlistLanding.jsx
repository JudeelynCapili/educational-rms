import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FeatureLanding.css';

const WaitlistLanding = () => {
  const [waitlistItems, setWaitlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const response = await api.get('/scheduling/waitlist/');
      // Handle paginated responses
      const waitlistData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setWaitlistItems(waitlistData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch waitlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteFromWaitlist = async (waitlistId) => {
    if (window.confirm('Promote this request to a confirmed booking?')) {
      try {
        await api.patch(`/scheduling/waitlist/${waitlistId}/`, { status: 'PROMOTED' });
        fetchWaitlist();
      } catch (err) {
        setError('Failed to promote request');
      }
    }
  };

  const handleRemoveFromWaitlist = async (waitlistId) => {
    if (window.confirm('Remove from waitlist?')) {
      try {
        await api.delete(`/scheduling/waitlist/${waitlistId}/`);
        fetchWaitlist();
      } catch (err) {
        setError('Failed to remove from waitlist');
      }
    }
  };

  if (loading) return <div className="feature-landing loading">Loading waitlist...</div>;

  return (
    <div className="feature-landing">
      <div className="feature-header">
        <div className="feature-title-section">
          <h1>📌 Waitlist Management</h1>
          <p className="feature-subtitle">Prioritize and promote waitlisted booking requests</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="feature-stats">
        <div className="stat-card">
          <div className="stat-number">{waitlistItems.length}</div>
          <div className="stat-label">Waitlist Items</div>
        </div>
      </div>

      <div className="feature-info">
        <h3>How Waitlist Works</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <h4>⏳ Queue System</h4>
            <p>Users join a queue when their requested time slot is unavailable</p>
          </div>
          <div className="feature-item">
            <h4>📊 Priority-Based</h4>
            <p>Requests are prioritized by submission time and user role</p>
          </div>
          <div className="feature-item">
            <h4>✅ Promote</h4>
            <p>When slots become available, promote waitlist users</p>
          </div>
          <div className="feature-item">
            <h4>🔔 Notifications</h4>
            <p>Users are notified when promoted to confirmed booking</p>
          </div>
        </div>
      </div>

      <div className="waitlist-table">
        {waitlistItems.length === 0 ? (
          <div className="empty-state">
            <p>No items on the waitlist. Great job staying on top of bookings!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Position</th>
                <th>User</th>
                <th>Requested Room</th>
                <th>Requested Date</th>
                <th>Time Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlistItems.map((item, index) => (
                <tr key={item.id}>
                  <td>#{index + 1}</td>
                  <td>{item.user_name || 'Unknown User'}</td>
                  <td>{item.room_name || 'N/A'}</td>
                  <td>{new Date(item.requested_date).toLocaleDateString()}</td>
                  <td>{item.requested_start_time} - {item.requested_end_time}</td>
                  <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handlePromoteFromWaitlist(item.id)}
                    >
                      Promote
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveFromWaitlist(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tips-section">
        <h3>💡 Waitlist Best Practices</h3>
        <ul>
          <li><strong>Regular Review:</strong> Check the waitlist weekly for promotion opportunities</li>
          <li><strong>FIFO Priority:</strong> Promote requests in the order they were submitted</li>
          <li><strong>Notify Users:</strong> Send notifications when users are promoted</li>
          <li><strong>Clean Up:</strong> Remove stale waitlist items if no slots become available</li>
          <li><strong>Alternative Options:</strong> Offer alternative times to waitlist users</li>
        </ul>
      </div>

      <button className="btn btn-large btn-primary" onClick={() => window.location.href = '/admin-scheduling?tab=bookings'}>
        Go to Booking Management
      </button>
    </div>
  );
};

export default WaitlistLanding;
