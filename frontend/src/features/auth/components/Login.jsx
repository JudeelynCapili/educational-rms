import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { LoginRegisterSkeleton } from '../../../components/Skeleton/Skeleton';
import { FaEnvelope, FaLock, FaCalendarAlt, FaBullseye, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 1) {
      errors.password = 'Password must be at least 1 character';
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth store and displayed via the 'error' state
    }
  };

  if (isLoading) {
    return <LoginRegisterSkeleton />;
  }

  return (
    <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="auth-brand-side">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="brand-logo-text">ER</div>
          </div>
          <h1 className="brand-title">Educational Resource Management</h1>
          <p className="brand-description">
            Streamline your academic resource scheduling and management with our comprehensive platform.
          </p>
          <div className="brand-features">
            <div className="brand-feature">
              <FaCalendarAlt className="feature-icon" />
              <div className="feature-text">Smart scheduling and booking system</div>
            </div>
            <div className="brand-feature">
              <FaBullseye className="feature-icon" />
              <div className="feature-text">Real-time availability tracking</div>
            </div>
            <div className="brand-feature">
              <FaChartBar className="feature-icon" />
              <div className="feature-text">Advanced analytics and reporting</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div className="auth-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className={`form-input ${validationErrors.email ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-input ${validationErrors.password ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            <motion.button type="submit" className="submit-btn" disabled={isLoading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <a href="/register" className="auth-link">
                Create an account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;

