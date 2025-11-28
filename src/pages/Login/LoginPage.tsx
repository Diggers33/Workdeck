import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

// Slideshow images for background
const slideshowImages = [
  '/assets/images/login/login_01.webp',
  '/assets/images/login/login_02.webp',
  '/assets/images/login/login_03.webp',
  '/assets/images/login/login_04.webp',
];

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Google icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

// Microsoft icon SVG
const MicrosoftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  // Shuffle images once on mount
  const shuffledImages = useMemo(() => shuffleArray(slideshowImages), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Mock login - replace with actual authentication
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email && password) {
        // Success - navigate to dashboard
        navigate('/');
      } else {
        setError('Please enter email and password');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log('Google login clicked');
  };

  const handleMicrosoftLogin = () => {
    // Implement Microsoft OAuth
    console.log('Microsoft login clicked');
  };

  return (
    <div className="login-outer">
      {/* Background slideshow */}
      <div className="cover-image">
        {shuffledImages.map((image, index) => (
          <div
            key={index}
            className="slideshow-image"
            style={{
              backgroundImage: `url(${image})`,
              animationDelay: `${index * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Logo on left side */}
      <img
        src="/assets/images/general/logo_01.svg"
        alt="Workdeck"
        className="logo-top-left"
      />
      <img
        src="/assets/images/general/logo_02.svg"
        alt="Workdeck"
        className="logo-center"
      />

      {/* Login form container */}
      <div className="login-container">
        <div className="login-form">
          <div className="login-content">
            {/* Upper part with logo and form */}
            <div className="upper-part">
              <div className="image-container">
                <img
                  src="/assets/images/general/logo_03.svg"
                  alt="Workdeck Logo"
                  className="logo-login"
                />
              </div>

              <div className="form-container">
                <form onSubmit={handleSubmit} className={error ? 'error' : ''}>
                  {error && <p className="error-message">{error}</p>}

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="off"
                    className={error ? 'input-error' : ''}
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={error ? 'input-error' : ''}
                  />

                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <div className="actions">
                    <div>
                      <Link to="/forgot-password" className="forgot-password">
                        Forgotten password?
                      </Link>
                    </div>
                    <div className="submit-container">
                      <button
                        type="submit"
                        className="login-button"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* OR divider */}
              <div className="or-content">
                <div className="or-content-text">or</div>
              </div>

              {/* OAuth buttons */}
              <div className="oauth">
                <div>
                  <button
                    type="button"
                    className="oauth-button google"
                    onClick={handleGoogleLogin}
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="oauth-button microsoft"
                    onClick={handleMicrosoftLogin}
                  >
                    <MicrosoftIcon />
                    Sign in with Microsoft
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="lower-part">
              <div className="footer">
                <p>&copy; {currentYear} Workdeck. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
