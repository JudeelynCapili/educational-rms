import React from 'react';
import './Modal.css';

const ConfirmModal = ({ title, message, type = 'warning', isOpen, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className={`modal-content ${typeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">{icon}</div>
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={isDangerous ? 'modal-btn-danger' : 'modal-btn-primary'} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
