import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { FaUser, FaIdBadge, FaEnvelope, FaLock, FaBuilding, FaCalendarAlt, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student',
    department: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth store and displayed via the 'error' state
    }
  };

  return (
    <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Brand Side */}
      <div className="auth-brand-side">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="brand-logo-text">ER</div>
          </div>
          <h1 className="brand-title">Join Our Platform</h1>
          <p className="brand-description">
            Start managing your educational resources efficiently with our comprehensive platform.
          </p>
          <div className="brand-features">
            <div className="brand-feature">
              <FaCalendarAlt className="feature-icon" />
              <div className="feature-text">Easy account setup in minutes</div>
            </div>
            <div className="brand-feature">
              <FaShieldAlt className="feature-icon" />
              <div className="feature-text">Secure and encrypted data</div>
            </div>
            <div className="brand-feature">
              <FaMobileAlt className="feature-icon" />
              <div className="feature-text">Access from any device</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <motion.div className="auth-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Fill in the details to get started</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label form-label-required">First Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className={`form-input ${validationErrors.first_name ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.first_name && (
                  <span className="error-message">{validationErrors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label form-label-required">Last Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`form-input ${validationErrors.last_name ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.last_name && (
                  <span className="error-message">{validationErrors.last_name}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label form-label-required">Username</label>
              <div className="input-with-icon">
                <FaIdBadge className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className={`form-input ${validationErrors.username ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.username && (
                <span className="error-message">{validationErrors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label form-label-required">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@university.edu"
                  className={`form-input ${validationErrors.email ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label form-label-required">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`form-input ${validationErrors.password ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.password && (
                  <span className="error-message">{validationErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm" className="form-label form-label-required">Confirm Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`form-input ${validationErrors.password_confirm ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.password_confirm && (
                  <span className="error-message">{validationErrors.password_confirm}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role" className="form-label form-label-required">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department" className="form-label">Department</label>
                <div className="input-with-icon">
                  <FaBuilding className="input-icon" />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Science"
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" className="auth-link">
                Sign in here
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;

