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
      id: 'features',
      label: '✨ All Features',
      icon: '⭐',
      available: isAdmin,
      submenu: [
        {
          id: 'rooms-feature',
          label: 'Room Management',
          icon: '🏢',
          path: '/features/rooms',
          description: 'Create, edit, delete rooms/labs',
        },
        {
          id: 'equipment-feature',
          label: 'Equipment & Time Slots',
          icon: '⚙️',
          path: '/features/equipment',
          description: 'Configure equipment, manage slots',
        },
        {
          id: 'bookings-feature',
          label: 'Booking Management',
          icon: '📋',
          path: '/features/bookings',
          description: 'Create, modify, cancel bookings',
        },
        {
          id: 'approval-feature',
          label: 'Booking Approval',
          icon: '✅',
          path: '/features/approval',
          description: 'Approve or reject requests',
        },
        {
          id: 'calendar-feature',
          label: 'Calendar View',
          icon: '📆',
          path: '/features/calendar',
          description: 'Day, week, month views',
        },
        {
          id: 'dragdrop-feature',
          label: 'Drag & Drop Scheduler',
          icon: '🖱️',
          path: '/features/drag-drop',
          description: 'Interactive event scheduling',
        },
        {
          id: 'recurring-feature',
          label: 'Recurring Bookings',
          icon: '🔄',
          path: '/features/recurring',
          description: 'Manage recurring patterns',
        },
        {
          id: 'conflicts-feature',
          label: 'Conflict Override',
          icon: '⚠️',
          path: '/features/conflict-override',
          description: 'Override conflict rules',
        },
        {
          id: 'waitlist-feature',
          label: 'Waitlist Management',
          icon: '📌',
          path: '/features/waitlist',
          description: 'Prioritize waitlist requests',
        },
      ],
    },
    {
      id: 'scheduling',
      label: 'Scheduling & Resources',
      icon: '📅',
      available: isAdmin,
      submenu: [
        {
          id: 'calendar',
          label: 'Calendar View',
          icon: '📆',
          path: '/admin-scheduling',
          state: { tab: 'calendar' },
          description: 'Day, week, month views',
        },
        {
          id: 'bookings',
          label: 'Booking Management',
          icon: '📋',
          path: '/admin-scheduling',
          state: { tab: 'bookings' },
          description: 'Create, modify, cancel bookings',
        },
        {
          id: 'rooms',
          label: 'Room Management',
          icon: '🏢',
          path: '/admin-scheduling',
          state: { tab: 'rooms' },
          description: 'Create, edit, delete rooms',
        },
        {
          id: 'equipment',
          label: 'Equipment Configuration',
          icon: '⚙️',
          path: '/admin-scheduling',
          state: { tab: 'resources' },
          description: 'Link equipment to rooms',
        },
      ],
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
