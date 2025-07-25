import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { createActor, canisterId } from 'declarations/backend';
import { getIdentityProvider, createAgentOptions, setupAgent } from './developmentConfig';

const AuthContext = createContext(null);

const defaultOptions = {
  /**
   * @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true,
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider: getIdentityProvider(),
    // Maximum authorization expiration is 8 days
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
  },
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create(defaultOptions.createOptions);
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const identity = client.getIdentity();
        setIdentity(identity);
        setPrincipal(identity.getPrincipal().toString());

        // Create authenticated actor with improved error handling
        try {
          const agentOptions = createAgentOptions(identity);
          const agent = new HttpAgent(agentOptions);
          
          await setupAgent(agent);

          const authenticatedActor = createActor(canisterId, {
            agent,
          });
          setActor(authenticatedActor);
          console.log("Successfully created authenticated actor");
        } catch (error) {
          console.error("Error creating authenticated actor:", error);
          
          // Enhanced fallback: try with default configuration
          try {
            console.log("Attempting fallback actor creation...");
            const fallbackActor = createActor(canisterId);
            setActor(fallbackActor);
            console.log("Fallback actor created successfully");
          } catch (fallbackError) {
            console.error("Fallback actor creation also failed:", fallbackError);
            // Set a null actor and let the UI handle it
            setActor(null);
          }
        }

        // Try to get user profile
        try {
          const profile = await authenticatedActor.get_user_profile();
          setUserProfile(profile.Ok || null);
        } catch (error) {
          console.log('User not registered yet:', error);
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return false;

    try {
      setLoading(true);
      const success = await new Promise((resolve) => {
        authClient.login({
          ...defaultOptions.loginOptions,
          onSuccess: () => resolve(true),
          onError: (error) => {
            console.error('Login error:', error);
            resolve(false);
          },
        });
      });

      if (success) {
        await initAuth(); // Re-initialize after login
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      setLoading(true);
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      setActor(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (username) => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      // Add timeout and retry logic for registration
      const result = await Promise.race([
        actor.register_user(username),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Registration timeout')), 10000)
        )
      ]);
      
      if (result.Ok) {
        setUserProfile(result.Ok);
        return { success: true, profile: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle certificate verification errors specifically
      if (error.message.includes('certificate verification failed') || 
          error.message.includes('signature could not be verified')) {
        return { 
          success: false, 
          error: 'Authentication issue with local development. Try refreshing the page or check console for details.' 
        };
      }
      
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const updateLastActive = async () => {
    if (!actor) return;

    try {
      await actor.update_last_active();
    } catch (error) {
      console.error('Update last active error:', error);
    }
  };

  const getUserSessions = async () => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      const result = await actor.get_user_sessions();
      if (result.Ok) {
        return { success: true, sessions: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Get sessions error:', error);
      return { success: false, error: error.message };
    }
  };

  const generateProgressReport = async () => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      const result = await actor.generate_user_progress_report();
      if (result.Ok) {
        return { success: true, report: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Generate progress report error:', error);
      return { success: false, error: error.message };
    }
  };

  const startTherapySession = async (sessionType, stressLevelBefore) => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      const result = await actor.start_therapy_session(sessionType, stressLevelBefore);
      if (result.Ok) {
        return { success: true, sessionId: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Start therapy session error:', error);
      return { success: false, error: error.message };
    }
  };

  const endTherapySession = async (sessionId, duration, stressLevelAfter, notes, pitch, tempo) => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      const result = await actor.end_therapy_session(
        sessionId,
        duration,
        stressLevelAfter,
        notes,
        pitch,
        tempo
      );
      if (result.Ok) {
        // Update user profile after session
        try {
          const profile = await actor.get_user_profile();
          setUserProfile(profile.Ok || null);
        } catch (error) {
          console.log('Could not update user profile:', error);
        }
        return { success: true, session: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('End therapy session error:', error);
      return { success: false, error: error.message };
    }
  };

  const getCBTReflection = async (thought) => {
    if (!actor) return { success: false, error: 'Not authenticated' };

    try {
      const result = await actor.get_cbt_reflection(thought);
      if (result.Ok) {
        return { success: true, reflection: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Get CBT reflection error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    identity,
    principal,
    actor,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 