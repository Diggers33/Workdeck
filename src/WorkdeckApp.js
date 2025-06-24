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
      const response = await fetch('https://test-api.workdeck.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
