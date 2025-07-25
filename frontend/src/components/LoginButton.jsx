import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocalDevAuth } from '../auth/LocalDevAuth';

// Check if we're in development mode - be more aggressive about detecting local development
const isDevelopment = true; // Force local development mode for now

const LoginButton = () => {
  // Use local dev auth in development, real auth in production
  const authHook = isDevelopment ? useLocalDevAuth : useAuth;
  const { isAuthenticated, userProfile, login, logout, registerUser, loading } = authHook();
  
  // Debug logging for LoginButton
  console.log('LoginButton - Development mode:', isDevelopment);
  console.log('LoginButton - Using auth hook:', isDevelopment ? 'LocalDevAuth' : 'RealAuth');
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const success = await login();
    if (success && !userProfile) {
      setShowRegistration(true);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setRegistering(true);
    setError('');
    
    const result = await registerUser(username.trim());
    
    if (result.success) {
      setShowRegistration(false);
      setUsername('');
    } else {
      setError(result.error);
    }
    
    setRegistering(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowRegistration(false);
    setUsername('');
    setError('');
  };

  if (loading) {
    return (
      <button className="bg-gray-500 text-white px-6 py-2 rounded-full font-semibold" disabled>
        Loading...
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 016.414 6.414z" />
        </svg>
        Login with Internet Identity
      </button>
    );
  }

  if (showRegistration || !userProfile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Complete Your Registration</h2>
        <p className="text-gray-600 mb-4">Choose a username to get started with MindSage</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !registering && username.trim()) {
                  handleRegister();
                }
              }}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={registering}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleRegister}
              disabled={registering}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {registering ? 'Creating Account...' : 'Create Account'}
            </button>
            <button
              onClick={handleLogout}
              disabled={registering}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-white">
        <span className="text-sm opacity-90">Welcome back, </span>
        <span className="font-semibold">{userProfile.username}</span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default LoginButton; 