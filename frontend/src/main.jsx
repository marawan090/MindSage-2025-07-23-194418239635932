import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LocalDevAuthProvider, useLocalDevAuth } from './auth/LocalDevAuth'
import LoginButton from './components/LoginButton'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

// Use local development for testing (avoids certificate issues)
const isDevelopment = true; // Use mock authentication for testing
// const isDevelopment = process.env.DFX_NETWORK !== "ic" || 
//                      process.env.NODE_ENV === "development" || 
//                      window.location.hostname === "localhost" || 
//                      window.location.hostname === "127.0.0.1" ||
//                      window.location.hostname.includes(".localhost");

function LandingPage() {
  return (
    <main className="font-sans">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white flex flex-col items-center justify-center px-6 text-center transition-all duration-500 relative">
        <div className="absolute top-6 right-6">
          <LoginButton />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg mb-6 animate-fadeIn">
          MindSage
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-8 leading-relaxed text-white/90">
          AI-powered voice therapy reimagined. Real EMDR and CBT sessions. Instant diagnosis. Emotional insight. Total privacy.
        </p>
      </section>

      {/* About */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">What is MindSage?</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          MindSage is a next-generation AI therapy platform that delivers real EMDR and CBT treatment through a voice-based AI agent.
          No appointments. No stigma. Just pure, evidence-based support — available anytime.
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <Feature title="Real EMDR & CBT Therapy" desc="Science-backed voice sessions guided by our intelligent AI therapist." />
          <Feature title="24/7 Smart Diagnosis" desc="Start with a chatbot that evaluates your mental state in minutes." />
          <Feature title="Emotional Voice Analysis" desc="Your voice reveals more than words — we track stress and recovery in real-time." />
          <Feature title="Progress Reports & Trends" desc="Understand your emotional patterns and growth with data-rich summaries." />
          <Feature title="Privacy & Security" desc="Your data stays private with Internet Computer's decentralized architecture." />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">Begin Your Healing Journey Today</h2>
        <p className="text-lg text-gray-600 mb-6">MindSage is secure and private. Login with Internet Identity to get started.</p>
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MindSage. All rights reserved.
      </footer>
    </main>
  )
}

function AppContent() {
  // Use local dev auth in development, real auth in production
  const authHook = isDevelopment ? useLocalDevAuth : useAuth;
  const { isAuthenticated, userProfile, loading } = authHook();
  
  // Debug logging
  console.log('Development mode:', isDevelopment);
  console.log('Using auth hook:', isDevelopment ? 'LocalDevAuth' : 'RealAuth');
  console.log('Current hostname:', window.location.hostname);
  console.log('DFX_NETWORK:', process.env.DFX_NETWORK);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading MindSage...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && userProfile) {
    return <Dashboard />;
  }

  return <LandingPage />;
}

function App() {
  const AuthContextProvider = isDevelopment ? LocalDevAuthProvider : AuthProvider;
  
  return (
    <ErrorBoundary>
      <AuthContextProvider>
        <AppContent />
      </AuthContextProvider>
    </ErrorBoundary>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <h3 className="text-2xl font-semibold mb-2 text-indigo-700">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
