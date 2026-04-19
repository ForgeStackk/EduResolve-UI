import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    className: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phoneNumber: ''
  });

  // Handle login form change
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle register form change
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle Login Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in AuthContext
        authLogin(data);
        
        // Redirect based on role
        if (data.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (data.role === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          className: registerForm.className,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role,
          phoneNumber: registerForm.phoneNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful, auto-login
        authLogin(data);
        
        // Redirect based on role
        if (data.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (data.role === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">EduResolve</h1>
        
        {error && <div className="error-message">{error}</div>}

        {!isRegistering ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="toggle-auth">
              Don't have an account?{' '}
              <button
                type="button"
                className="toggle-button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          // REGISTRATION FORM
          <form onSubmit={handleRegister} className="login-form">
            <h2>Register</h2>
            
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-class">Class</label>
                <input
                  id="reg-class"
                  type="text"
                  name="className"
                  value={registerForm.className}
                  onChange={handleRegisterChange}
                  placeholder="e.g., 10A"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-password">Confirm Password</label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-role">Role</label>
                <select
                  id="reg-role"
                  name="role"
                  value={registerForm.role}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phoneNumber"
                  value={registerForm.phoneNumber}
                  onChange={handleRegisterChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <p className="toggle-auth">
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
