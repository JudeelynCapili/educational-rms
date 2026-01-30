import React, { useState } from 'react';
import './Modal.css';

const PromptModal = ({ title, label, placeholder, type = 'info', isOpen, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', required = false }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (required && !input.trim()) {
      return;
    }
    onConfirm(input);
    setInput('');
  };

  const handleCancel = () => {
    setInput('');
    onCancel();
  };

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
    <div className="modal-overlay" onClick={handleCancel}>
      <div className={`modal-content ${typeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">{icon}</div>
          <h2>{title}</h2>
          <button className="modal-close" onClick={handleCancel}>×</button>
        </div>
        <div className="modal-body">
          <label className="modal-label">{label}</label>
          <textarea
            className="modal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows="4"
          />
          {required && !input.trim() && (
            <p className="modal-error-text">This field is required</p>
          )}
        </div>
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={handleCancel}>
            {cancelText}
          </button>
          <button className="modal-btn-primary" onClick={handleConfirm} disabled={required && !input.trim()}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
