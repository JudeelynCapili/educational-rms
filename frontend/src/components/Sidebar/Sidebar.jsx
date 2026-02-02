import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userRole, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin - handle multiple role formats
  const isAdmin = userRole === 'ADMIN' 
    || userRole === 'FACULTY' 
    || userRole?.toUpperCase?.() === 'ADMIN'
    || userRole?.toUpperCase?.() === 'FACULTY';

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      available: true,
    },
    {
      id: 'scheduling',
      label: 'Scheduling & Resources',
      icon: '📅',
      available: isAdmin,
      path: '/admin-scheduling',
      state: { tab: 'calendar' },
      description: 'Manage scheduling, bookings, and rooms',
    },
    {
      id: 'simulation',
      label: 'Capacity Analysis',
      icon: '📊',
      path: '/capacity',
      available: isAdmin,
      description: 'Monitor utilization and plan growth',
    },
  ];

  const toggleSubmenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleNavigation = (item) => {
    if (item.submenu) {
      toggleSubmenu(item.id);
    } else {
      navigate(item.path, { state: item.state });
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) =>
    submenu.some((item) => isActive(item.path));

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className={`sidebar-brand ${isCollapsed ? 'hidden' : ''}`}>
          <div className="brand-icon">RM</div>
          <span className="brand-text">RMS</span>
        </div>
        <button
          className="toggle-btn"
          onClick={handleToggleCollapse}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            if (!item.available) return null;

            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];
            const isActiveMenu = hasSubmenu
              ? isSubmenuActive(item.submenu)
              : isActive(item.path);

            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${isActiveMenu ? 'active' : ''}`}
                  onClick={() => handleNavigation(item)}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                    {item.label}
                  </span>
                  {hasSubmenu && (
                    <span
                      className={`submenu-arrow ${isExpanded ? 'expanded' : ''}`}
                    >
                      ▶
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && isExpanded && !isCollapsed && (
                  <ul className="submenu">
                    {item.submenu.map((subitem) => (
                      <li key={subitem.id} className="submenu-item">
                        <button
                          className={`submenu-link ${
                            isActive(subitem.path) ? 'active' : ''
                          }`}
                          onClick={() =>
                            navigate(subitem.path, { state: subitem.state })
                          }
                        >
                          <span className="submenu-icon">{subitem.icon}</span>
                          <span className="submenu-label">{subitem.label}</span>
                          <span className="submenu-desc">
                            {subitem.description}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className={`sidebar-footer ${isCollapsed ? 'collapsed-footer' : ''}`}>
        <div className="sidebar-info">
          <div className="info-icon">ℹ️</div>
          <p className={`info-text ${isCollapsed ? 'hidden' : ''}`}>
            Manage all scheduling and resource tasks from here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
