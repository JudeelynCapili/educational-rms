import React, { useState } from 'react';
import { approveBooking, rejectBooking } from '../../services/schedulingApi';
import './Dashboard.css';

const QuickBookingApproval = ({ booking, onApproved, onRejected }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveBooking(booking.id);
      onApproved(booking.id);
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await rejectBooking(booking.id, { rejection_reason: rejectionReason });
      onRejected(booking.id);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert('Failed to reject booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pending-request-card">
        <div className="request-header">
          <div className="request-user">
            <div className="user-icon">👤</div>
            <div>
              <p className="request-user-name">{booking.user_name}</p>
              <p className="request-room">{booking.room_name}</p>
            </div>
          </div>
          <span className={`priority-badge ${booking.priority.toLowerCase()}`}>
            {booking.priority}
          </span>
        </div>
        <div className="request-details">
          <p className="request-date">
            📅 {new Date(booking.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          <p className="request-time">⏰ {booking.time}</p>
        </div>
        <p className="request-purpose">{booking.purpose}</p>
        <div className="request-actions">
          <button 
            className="approve-btn-quick"
            onClick={handleApprove}
            disabled={loading}
          >
            ✓ Approve
          </button>
          <button 
            className="reject-btn-quick"
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
          >
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Booking Request</h3>
            <p className="modal-description">Please provide a reason for rejecting this booking:</p>
            <textarea
              className="rejection-textarea"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
            />
            <div className="modal-actions">
              <button 
                className="modal-btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="modal-btn-danger"
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? 'Rejecting...' : 'Reject Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickBookingApproval;
