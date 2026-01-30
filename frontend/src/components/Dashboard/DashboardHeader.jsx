import React from 'react';
import './Dashboard.css';

const DashboardHeader = ({ user, onLogout }) => {
  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-brand">
          <div className="brand-logo">ER</div>
          <div className="brand-info">
            <h1>Educational Resource Management</h1>
            <p>Your comprehensive resource management platform</p>
          </div>
        </div>
        <div className="header-user">
          <div className="user-avatar">
            {getInitials(user.first_name, user.last_name, user.username)}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user.first_name} {user.last_name}
            </p>
            <p className="user-role">{user.role || 'User'}</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
