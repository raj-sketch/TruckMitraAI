import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';
import '../../index.css';

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const [userType, setUserType] = useState("Shipper");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (action !== "Login" && name.trim() === "") {
      newErrors.name = "Name is required";
    }
    
    if (email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (phone.trim() === "") {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (action === "Login") {
        alert(`Successfully logged in as ${userType} with Email: ${email}`);
      } else {
        alert(`Successfully signed up user: ${name} as ${userType} with Email: ${email} and Phone: ${phone}`);
      }
    }, 1500);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Apply theme class to body element
    if (!isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={`container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Theme toggle button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkTheme ? '☀️' : '🌙'}
      </button>
      
      {/* User type selection tabs */}
      <div className="user-type-tabs">
        <div
          className={userType === "Shipper" ? "tab active-tab" : "tab"}
          onClick={() => setUserType("Shipper")}
        >
          <span className="tab-icon">🚛</span>
          Shipper
        </div>
        <div
          className={userType === "Loader" ? "tab active-tab" : "tab"}
          onClick={() => setUserType("Loader")}
        >
          <span className="tab-icon">📦</span>
          Loader
        </div>
      </div>

      <div className="header">
        <div className="brand-logo">
          <span className="truck-icon">🚛</span>
          <div className="brand-text">
            <h1 className="brand-name">Truck Mitra AI</h1>
            <p className="brand-tagline">Smart Logistics Solutions</p>
          </div>
        </div>
        <div className="text">{action}</div>
        <div className="underline"></div>
        <p className="subtitle">Welcome to Truck Mitra AI - Your Logistics Partner</p>
      </div>

      <div className="form-container">
        <div className="inputs">
          {action === "Login" ? null : (
            <div className="input-group">
              <div className={`input ${errors.name ? 'error' : ''}`}>
                <img src={user_icon} alt="User Icon" className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}
          <div className="input-group">
            <div className={`input ${errors.email ? 'error' : ''}`}>
              <img src={email_icon} alt="Email Icon" className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="input-group">
            <div className={`input ${errors.phone ? 'error' : ''}`}>
              <span className="input-icon">📱</span>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError('phone');
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          <div className="input-group">
            <div className={`input ${errors.password ? 'error' : ''}`}>
              <img src={password_icon} alt="Password Icon" className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          {action === "Sign Up" ? null : (
            <div className="forgot-password">
              Forgot password? <span>Click Here !!!</span>
            </div>
          )}
        </div>

        {/* Side by side action buttons */}
        <div className="action-buttons">
          <button
            className={`action-btn ${action === "Login" ? "active" : ""}`}
            onClick={() => setAction("Login")}
          >
            <span className="btn-icon">🔑</span>
            Login
          </button>
          <button
            className={`action-btn ${action === "Sign Up" ? "active" : ""}`}
            onClick={() => setAction("Sign Up")}
          >
            <span className="btn-icon">✍️</span>
            Sign Up
          </button>
        </div>

        {/* Main submit button */}
        <button
          className="main-submit-btn"
          onClick={handleSubmit}
          disabled={isLoading || (action === "Sign Up"
            ? !name || !email || !phone || !password
            : !email || !phone || !password)}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              <span className="btn-text">Processing...</span>
            </>
          ) : (
            <>
              <span className="btn-text">{action}</span>
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LoginSignup;
