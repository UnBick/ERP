import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../common/Footer';
import './LoginForm.css';

const LoginForm = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const userData = { identifier: admissionNumber, password };
  
      const response = await fetch(getApiUrl('/api/v1/auth/login'), {  // Updated endpoint path
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
  
      const result = await response.json();
      console.log('Server response:', result); // Debugging log
  
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
  
      if (result.success) {
        const { token, user } = result.data;
  
        if (!token || !user) {
          throw new Error('Invalid response data');
        }
  
        // 🔹 Store token in localStorage for future authentication
        localStorage.setItem('authToken', token);
  
        // 🔹 Store user details in localStorage (optional)
        localStorage.setItem('user', JSON.stringify(user));
  
        await login(user, token); // Updating AuthContext
  
        // 🔹 Redirect to the correct dashboard based on role
        const roleRoutes = {
          admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
          parent: '/parent/dashboard',
        };
        
        const targetRoute = roleRoutes[user.role] || '/';
        console.log('Navigating to:', targetRoute, 'for role:', user.role);
        navigate(targetRoute);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const result = await response.json();
      if (result.success) {
        const { token, role } = result;
        await login({ phone }, token);

        const roleRoutes = {
          admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
          parent: '/parent/dashboard',
        };
        navigate(roleRoutes[role] || '/');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  /*const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  if (showAnimation) {
    return <Slider onAnimationComplete={handleAnimationComplete} />;
  }*/

  return (
    <div className="login-wrapper" style={{ animation: 'fadeIn 1s ease-in-out' }}>
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Sign in to School Portal</h1>

          {error && <div className="error-message">{error}</div>}

          {isOtpLogin ? (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="form-group">
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {otpSent && (
                <div className="form-group">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    required
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Processing...' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <input
                  type="text"
                  id="admissionNumber"
                  name="admissionNumber"
                  required
                  placeholder="Username"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </form>
          )}

          <div className="toggle-login-method">
            <button
              type="button"
              onClick={() => {
                setIsOtpLogin(!isOtpLogin);
                setOtpSent(false);
                setError('');
              }}
            >
              {isOtpLogin ? 'Use Admission Number & Password' : 'Use OTP'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginForm;
