import React, { createContext, useContext, useState } from 'react';

// Simple local development authentication context
const LocalDevAuthContext = createContext(null);

export const LocalDevAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    // Simulate login for local development
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  const registerUser = async (username) => {
    if (!username.trim()) {
      return { success: false, error: 'Username cannot be empty' };
    }

    // Simulate user registration for local development
    const mockProfile = {
      principal: 'dev-principal-' + Date.now(),
      username: username.trim(),
      created_at: Date.now() * 1000000, // Convert to nanoseconds
      last_active: Date.now() * 1000000,
      session_count: 0,
      total_sessions: 0,
    };

    setUserProfile(mockProfile);
    return { success: true, profile: mockProfile };
  };

  const getUserSessions = async () => {
    // Return empty sessions for local development
    return { success: true, sessions: [] };
  };

  const generateProgressReport = async () => {
    return { 
      success: false, 
      error: 'No sessions found for user' 
    };
  };

  const startTherapySession = async (sessionType, stressLevelBefore) => {
    // Mock session creation
    const sessionId = 'dev-session-' + Date.now();
    return { success: true, sessionId };
  };

  const endTherapySession = async (sessionId, duration, stressLevelAfter, notes, pitch, tempo) => {
    // Mock session ending
    const mockSession = {
      id: sessionId,
      user_principal: 'dev-principal',
      session_type: 'CBT',
      timestamp: Date.now() * 1000000,
      duration,
      stress_level_before: 5,
      stress_level_after: stressLevelAfter,
      notes,
      voice_analysis: {
        pitch,
        tempo,
        emotion: 'Neutral',
        stress_indicators: []
      }
    };

    // Update user profile mock
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        total_sessions: userProfile.total_sessions + 1,
        last_active: Date.now() * 1000000
      });
    }

    return { success: true, session: mockSession };
  };

  const getCBTReflection = async (thought) => {
    // Mock CBT reflection
    const reflections = [
      "Try to reframe: Everyone fails sometimes. What did you learn from this experience?",
      "Challenge that thought: Is that 100% true? What evidence do you have?",
      "Question this all-or-nothing thinking: What is one thing you did well today?",
      "Reflect: Is this thought helping you or hurting you? How would you talk to a friend having this thought?"
    ];
    
    const randomReflection = reflections[Math.floor(Math.random() * reflections.length)];
    return { success: true, reflection: randomReflection };
  };

  const updateLastActive = async () => {
    // Mock function
    return;
  };

  const value = {
    isAuthenticated,
    userProfile,
    loading,
    login,
    logout,
    registerUser,
    updateLastActive,
    getUserSessions,
    generateProgressReport,
    startTherapySession,
    endTherapySession,
    getCBTReflection,
    // Add these for compatibility
    identity: null,
    principal: userProfile?.principal || null,
    actor: null,
  };

  return (
    <LocalDevAuthContext.Provider value={value}>
      {children}
    </LocalDevAuthContext.Provider>
  );
};

export const useLocalDevAuth = () => {
  const context = useContext(LocalDevAuthContext);
  if (!context) {
    throw new Error('useLocalDevAuth must be used within a LocalDevAuthProvider');
  }
  return context;
};

export default LocalDevAuthContext; 