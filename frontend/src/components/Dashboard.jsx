import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocalDevAuth } from '../auth/LocalDevAuth';

// Use local development for testing (avoids certificate issues)
const isDevelopment = true; // Use mock authentication for testing

const Dashboard = () => {
  // Use local dev auth in development, real auth in production
  const authHook = isDevelopment ? useLocalDevAuth : useAuth;
  const { 
    userProfile, 
    getUserSessions, 
    generateProgressReport, 
    startTherapySession, 
    endTherapySession,
    getCBTReflection,
    updateLastActive 
  } = authHook();
  
  const [sessions, setSessions] = useState([]);
  const [progressReport, setProgressReport] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Session form state
  const [sessionType, setSessionType] = useState('CBT');
  const [stressLevelBefore, setStressLevelBefore] = useState(5);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [stressLevelAfter, setStressLevelAfter] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // CBT Reflection state
  const [thought, setThought] = useState('');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    loadDashboardData();
    updateLastActive();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sessionsResult, reportResult] = await Promise.all([
        getUserSessions(),
        generateProgressReport()
      ]);

      if (sessionsResult.success) {
        setSessions(sessionsResult.sessions);
      }

      if (reportResult.success) {
        setProgressReport(reportResult.report);
      } else if (reportResult.error.includes('No sessions found')) {
        setProgressReport(null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      setError('');
      const result = await startTherapySession(sessionType, stressLevelBefore);
      
      if (result.success) {
        setActiveSession({
          id: result.sessionId,
          type: sessionType,
          startTime: Date.now(),
          stressLevelBefore
        });
        setSessionDuration(0);
        
        // Start timer
        const timer = setInterval(() => {
          setSessionDuration(prev => prev + 1);
        }, 60000); // Update every minute
        
        setActiveSession(prev => ({ ...prev, timer }));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to start session');
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      // Clear timer
      if (activeSession.timer) {
        clearInterval(activeSession.timer);
      }

      // Simulate voice analysis data (in real app, this would come from voice processing)
      const mockPitch = 180 + Math.random() * 140; // 180-320 Hz
      const mockTempo = 100 + Math.random() * 120; // 100-220 words/min

      const result = await endTherapySession(
        activeSession.id,
        sessionDuration,
        stressLevelAfter,
        sessionNotes,
        mockPitch,
        mockTempo
      );

      if (result.success) {
        setActiveSession(null);
        setSessionNotes('');
        setStressLevelAfter(5);
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to end session');
    }
  };

  const handleGetReflection = async () => {
    if (!thought.trim()) return;

    try {
      const result = await getCBTReflection(thought);
      if (result.success) {
        setReflection(result.reflection);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to get reflection');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.username}!
          </h1>
          <p className="text-gray-600">
            Track your progress, start new sessions, and continue your healing journey.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'session', label: 'New Session', icon: '🎯' },
              { id: 'cbt', label: 'CBT Reflection', icon: '💭' },
              { id: 'history', label: 'Session History', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sessions</h3>
              <p className="text-3xl font-bold text-indigo-600">{userProfile?.total_sessions || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Therapy sessions completed</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Trend</h3>
              <p className="text-xl font-bold text-green-600">
                {progressReport ? progressReport.trend : 'Start your first session'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Based on recent sessions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg. Stress Reduction</h3>
              <p className="text-3xl font-bold text-purple-600">
                {progressReport ? `${progressReport.avg_stress_reduction.toFixed(1)}` : '--'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Points per session</p>
            </div>

            {/* Progress Report */}
            {progressReport && (
              <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-2">
                  {progressReport.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-indigo-600 mt-1">•</span>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'session' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {!activeSession ? (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Start New Therapy Session</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CBT">Cognitive Behavioral Therapy (CBT)</option>
                      <option value="EMDR">Eye Movement Desensitization (EMDR)</option>
                      <option value="Assessment">Mental Health Assessment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Stress Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevelBefore}
                      onChange={(e) => setStressLevelBefore(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1 - Very Calm</span>
                      <span className="font-medium">{stressLevelBefore}</span>
                      <span>10 - Very Stressed</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartSession}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:opacity-90 transition"
                  >
                    Start Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Session in Progress</h2>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{activeSession.type} Session Active</p>
                      <p className="text-sm text-green-600">Duration: {formatDuration(sessionDuration)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Notes
                    </label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="How are you feeling? What thoughts came up during the session?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stress Level After Session (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevelAfter}
                      onChange={(e) => setStressLevelAfter(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1 - Very Calm</span>
                      <span className="font-medium">{stressLevelAfter}</span>
                      <span>10 - Very Stressed</span>
                    </div>
                  </div>

                  <button
                    onClick={handleEndSession}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-md font-semibold hover:opacity-90 transition"
                  >
                    End Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cbt' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">CBT Thought Reflection</h2>
              <p className="text-gray-600 mb-6">
                Share a thought or feeling you're struggling with, and get personalized CBT guidance.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What thought is troubling you?
                  </label>
                  <textarea
                    value={thought}
                    onChange={(e) => setThought(e.target.value)}
                    placeholder="e.g., 'I'm a failure', 'No one cares about me', 'I can't do anything right'..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>

                <button
                  onClick={handleGetReflection}
                  disabled={!thought.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  Get CBT Reflection
                </button>

                {reflection && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">CBT Guidance:</h4>
                    <p className="text-indigo-800">{reflection}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Session History</h2>
            
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No sessions yet</p>
                <button
                  onClick={() => setActiveTab('session')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Start Your First Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.session_type}</h3>
                        <p className="text-sm text-gray-500">{formatDate(session.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{formatDuration(session.duration)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Stress Before</p>
                        <p className="font-medium text-red-600">{session.stress_level_before}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stress After</p>
                        <p className="font-medium text-green-600">{session.stress_level_after}/10</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Voice Analysis</p>
                      <p className="text-sm text-gray-700">
                        Emotion: <span className="font-medium">{session.voice_analysis.emotion}</span>
                      </p>
                    </div>

                    {session.notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 