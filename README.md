# MindSage - AI-Powered Voice Therapy Platform

MindSage is a next-generation AI therapy platform that delivers real EMDR and CBT treatment through voice-based AI interactions. Built on the Internet Computer (IC), it provides secure, private, and decentralized mental health support with no appointments needed.

![MindSage Banner](https://img.shields.io/badge/MindSage-AI%20Therapy%20Platform-purple?style=for-the-badge)

## 🌟 Features

### 🎯 **Core Therapy Features**
- **Real EMDR & CBT Sessions** - Science-backed therapy protocols guided by AI
- **Voice Analysis** - Real-time emotional state detection through voice patterns
- **24/7 Availability** - Access therapy support anytime, anywhere
- **Progress Tracking** - Comprehensive analytics and personalized insights
- **Session Management** - Start, track, and analyze therapy sessions

### 🔐 **Authentication & Security**
- **Internet Identity Integration** - Passwordless authentication using IC's native identity system
- **Principal-based Access Control** - Secure user data isolation
- **Local Development Mode** - Simplified authentication for development
- **Privacy First** - All data stored securely on the decentralized Internet Computer

### 📊 **Mental Health Tools**
- **CBT Reflection Engine** - AI-powered cognitive behavioral therapy guidance
- **Stress Level Tracking** - Before/after session stress measurement
- **Emotion Detection** - Voice pattern analysis for emotional insights
- **Progress Reports** - Personalized recommendations and trend analysis
- **Session History** - Complete therapy journey documentation

## 🏗️ Architecture

### **Backend (Rust)**
- **Canister-based Architecture** - Leverages IC's actor model
- **Stable Memory Storage** - Persistent user data and session storage
- **Authentication Layer** - Principal-based user management
- **Therapy Engine** - Core therapy session logic and analysis

### **Frontend (React + Vite)**
- **Modern React Application** - Responsive, component-based architecture
- **Tailwind CSS** - Beautiful, accessible UI design
- **Authentication Context** - Seamless auth state management
- **Development/Production Modes** - Adaptive authentication systems

## 🚀 Quick Start

### Prerequisites
- [IC SDK (dfx)](https://internetcomputer.org/docs/building-apps/getting-started/install) v0.28.0+
- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) (for backend compilation)

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd MindSage-2025-07-23-194418239635932
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install
```

### 3. Deploy Locally
```bash
# Start local IC replica
dfx start --clean --background

# Deploy all canisters
dfx deploy

# Get the frontend URL
echo "Frontend URL: http://$(dfx canister id frontend).localhost:4943"
```

### 4. Access the Application
Open the provided frontend URL in your browser and start your therapy journey!

## 🔧 Development

### **Local Development Mode**
The application automatically detects local development and uses a simplified authentication system:
- **No Internet Identity Required** - Mock authentication for easy testing
- **Instant Registration** - Immediate username registration
- **Simulated Data** - Mock therapy sessions and progress data
- **Full Feature Access** - All features work with test data

### **Production Mode**
When deployed to IC mainnet:
- **Full Internet Identity** - Real passwordless authentication
- **Persistent Storage** - User data stored in stable memory
- **Real Canister Calls** - Actual blockchain interactions
- **Secure Access Control** - Principal-based data isolation

### **Switching Between Modes**
To switch from development to production mode, edit `frontend/src/main.jsx`:

```javascript
// Development mode (current)
const isDevelopment = true; 

// Production mode
const isDevelopment = process.env.DFX_NETWORK !== "ic" || 
                     process.env.NODE_ENV === "development" || 
                     window.location.hostname === "localhost" || 
                     window.location.hostname === "127.0.0.1" ||
                     window.location.hostname.includes(".localhost");
```

## 📱 User Journey

### **1. Landing Page**
- Beautiful gradient hero section
- Feature showcase
- Authentication entry point

### **2. Authentication**
- **Development**: Instant mock login
- **Production**: Internet Identity integration
- Username registration for new users

### **3. Dashboard**
Four main sections:
- **Overview**: Progress statistics and recommendations
- **New Session**: Start therapy sessions with stress tracking
- **CBT Reflection**: Get AI-powered cognitive behavioral therapy guidance
- **Session History**: Complete therapy journey documentation

### **4. Therapy Sessions**
- Choose session type (CBT, EMDR, Assessment)
- Set initial stress level
- Real-time session tracking
- Voice analysis integration
- Post-session evaluation

## 🗂️ Project Structure

```
MindSage/
├── backend/                 # Rust backend canister
│   ├── lib.rs              # Main canister logic
│   ├── Cargo.toml          # Rust dependencies
│   └── backend.did         # Candid interface (auto-generated)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── auth/           # Authentication system
│   │   │   ├── AuthContext.jsx        # Main auth context
│   │   │   ├── LocalDevAuth.jsx       # Development auth
│   │   │   └── developmentConfig.js   # Dev configuration
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── LoginButton.jsx        # Authentication UI
│   │   │   └── ErrorBoundary.jsx      # Error handling
│   │   ├── main.jsx        # App entry point
│   │   └── index.css       # Tailwind styles
│   ├── index.html          # HTML template
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
├── src/declarations/       # Auto-generated IC bindings
├── dfx.json               # IC project configuration
└── README.md              # This file
```

## 🔐 Security & Privacy

### **Data Protection**
- **On-Chain Storage** - All user data stored securely on Internet Computer
- **Principal Isolation** - Each user's data is completely isolated
- **No Server Dependencies** - Fully decentralized architecture
- **End-to-End Encryption** - IC's built-in cryptographic security

### **Authentication Security**
- **Internet Identity** - Passwordless, phishing-resistant authentication
- **Principal-based Access** - Cryptographic user identification
- **Session Management** - Secure session handling with automatic timeouts
- **Development Safety** - Isolated mock authentication for local testing

### **Best Practices Implemented**
- Input validation and sanitization
- Error boundary protection
- Secure storage patterns
- Authentication state management
- Privacy-preserving voice analysis

## 🧠 Therapy Features Deep Dive

### **Voice Analysis Engine**
- **Pitch Detection** - Emotional state inference from vocal pitch
- **Tempo Analysis** - Stress level assessment from speech speed
- **Emotion Classification** - AI categorization (Neutral, Anxiety, Stress, etc.)
- **Stress Indicators** - Real-time stress pattern detection

### **CBT Reflection System**
Responds to common cognitive distortions:
- **All-or-Nothing Thinking** - "I'm a failure" → Reframing guidance
- **Mind Reading** - "No one cares" → Evidence-based challenges
- **Catastrophizing** - "It's hopeless" → Perspective shifting
- **Custom Responses** - Adaptive AI responses to user inputs

### **Progress Analytics**
- **Session Count Tracking** - Total therapy sessions completed
- **Stress Reduction Metrics** - Before/after session improvements
- **Trend Analysis** - Progress over time visualization
- **Personalized Recommendations** - AI-driven therapy suggestions

## 🌐 Deployment

### **Local Deployment**
```bash
dfx deploy --playground
```

### **IC Mainnet Deployment**
```bash
# Add mainnet network identity
dfx identity use default

# Deploy to mainnet
dfx deploy --network ic --with-cycles 2000000000000
```

### **Custom Network**
```bash
# Configure custom network in dfx.json
dfx deploy --network <your-network>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Internet Computer Documentation](https://internetcomputer.org/docs)
- **Developer Discord**: [IC Developer Community](https://discord.gg/icdevs)
- **Forum**: [IC Developer Forum](https://forum.dfinity.org/)

## 🙏 Acknowledgments

- **Internet Computer** - For providing the secure, decentralized infrastructure
- **IC Community** - For the amazing developer tools and support
- **Mental Health Community** - For inspiration and guidance on therapy best practices

---

**MindSage** - Revolutionizing mental health care through AI and decentralized technology. 🧠✨
