import React, { useState, useEffect } from 'react';
import { Calendar, User, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import ResourcePlanner from './ResourcePlanner';

const WorkdeckApp = () => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('workdeck_token');
    if (savedToken) {
      setAuthToken(savedToken);
    }
  }, []);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use a CORS proxy for GitHub Pages
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const response = await fetch(`${proxyUrl}https://test-api.workdeck.com/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          mail: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const token = data.result;

      if (token) {
        setAuthToken(token);
        localStorage.setItem('workdeck_token', token);
      } else {
        throw new Error('No token received from Workdeck');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('workdeck_token');
  };

  // If authenticated, show the Resource Planner
  if (authToken) {
    return <ResourcePlanner workdeckToken={authToken} onLogout={handleLogout} />;
  }

  // Otherwise, show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Workdeck Resource Planner
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Workdeck account to see live team data
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Authentication Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <LoginForm 
            onLogin={handleLogin} 
            isLoading={isLoading} 
            showPassword={showPassword} 
            setShowPassword={setShowPassword} 
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you'll see your live Workdeck team members, projects, and tasks
          </p>
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, isLoading, showPassword, setShowPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="mt-1 relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="your-email@company.com"
          />
          <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
          <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          onClick={handleSubmit}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting to Workdeck...
            </>
          ) : (
            'Sign In & Load Resource Planner'
          )}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">For testing:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div><strong>Email:</strong> demo@workdeck.com</div>
            <div><strong>Password:</strong> demo123</div>
            <div className="text-xs text-gray-500 mt-2">
              * Use your actual Workdeck credentials to see real team data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkdeckApp;
