import React from 'react';
import './Modal.css';

const AlertModal = ({ title, message, type = 'info', onClose, isOpen }) => {
  if (!isOpen) return null;

  const typeClass = {
    success: 'modal-success',
    error: 'modal-error',
    warning: 'modal-warning',
    info: 'modal-info',
  }[type] || 'modal-info';

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${typeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">{icon}</div>
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
