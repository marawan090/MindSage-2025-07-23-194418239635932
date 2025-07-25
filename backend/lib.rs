use std::cell::RefCell;
use ic_cdk::caller;
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use serde::Serialize;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UserProfile {
    pub principal: Principal,
    pub username: String,
    pub created_at: u64,
    pub last_active: u64,
    pub session_count: u32,
    pub total_sessions: u32,
}

impl Storable for UserProfile {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1000,
        is_fixed_size: false,
    };
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct TherapySession {
    pub id: String,
    pub user_principal: Principal,
    pub session_type: String, // "EMDR", "CBT", "Assessment"
    pub timestamp: u64,
    pub duration: u32, // in minutes
    pub stress_level_before: f32,
    pub stress_level_after: f32,
    pub notes: String,
    pub voice_analysis: VoiceAnalysis,
}

impl Storable for TherapySession {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 2000,
        is_fixed_size: false,
    };
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct VoiceAnalysis {
    pub pitch: f32,
    pub tempo: f32,
    pub emotion: String,
    pub stress_indicators: Vec<String>,
}

impl Storable for VoiceAnalysis {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 500,
        is_fixed_size: false,
    };
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ProgressReport {
    pub user_principal: Principal,
    pub total_sessions: u32,
    pub avg_stress_reduction: f32,
    pub trend: String,
    pub recommendations: Vec<String>,
    pub generated_at: u64,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static USER_PROFILES: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    
    static THERAPY_SESSIONS: RefCell<StableBTreeMap<String, TherapySession, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
    
    static SESSION_COUNTER: RefCell<u64> = RefCell::new(0);
}

// Authentication helper
fn require_auth() -> Result<Principal, String> {
    let caller = caller();
    if caller == Principal::anonymous() {
        Err("Authentication required".to_string())
    } else {
        Ok(caller)
    }
}

fn get_current_time() -> u64 {
    ic_cdk::api::time()
}

// User Management Functions
#[update]
pub fn register_user(username: String) -> Result<UserProfile, String> {
    let caller_principal = require_auth()?;
    
    if username.trim().is_empty() {
        return Err("Username cannot be empty".to_string());
    }
    
    USER_PROFILES.with(|profiles| {
        let mut profiles = profiles.borrow_mut();
        
        // Check if user already exists
        if profiles.contains_key(&caller_principal) {
            return Err("User already registered".to_string());
        }
        
        let user_profile = UserProfile {
            principal: caller_principal,
            username,
            created_at: get_current_time(),
            last_active: get_current_time(),
            session_count: 0,
            total_sessions: 0,
        };
        
        profiles.insert(caller_principal, user_profile.clone());
        Ok(user_profile)
    })
}

#[query]
pub fn get_user_profile() -> Result<UserProfile, String> {
    let caller_principal = require_auth()?;
    
    USER_PROFILES.with(|profiles| {
        let profiles = profiles.borrow();
        profiles.get(&caller_principal)
            .ok_or("User not found. Please register first.".to_string())
    })
}

#[update]
pub fn update_last_active() -> Result<(), String> {
    let caller_principal = require_auth()?;
    
    USER_PROFILES.with(|profiles| {
        let mut profiles = profiles.borrow_mut();
        if let Some(mut profile) = profiles.get(&caller_principal) {
            profile.last_active = get_current_time();
            profiles.insert(caller_principal, profile);
            Ok(())
        } else {
            Err("User not found".to_string())
        }
    })
}

// Therapy Session Functions
#[update]
pub fn start_therapy_session(session_type: String, stress_level_before: f32) -> Result<String, String> {
    let caller_principal = require_auth()?;
    
    // Verify user exists
    USER_PROFILES.with(|profiles| {
        let profiles = profiles.borrow();
        if !profiles.contains_key(&caller_principal) {
            return Err("User not registered. Please register first.".to_string());
        }
        Ok(())
    })?;
    
    let session_id = SESSION_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        format!("session_{}", *counter)
    });
    
    let session = TherapySession {
        id: session_id.clone(),
        user_principal: caller_principal,
        session_type,
        timestamp: get_current_time(),
        duration: 0,
        stress_level_before,
        stress_level_after: stress_level_before, // Will be updated when session ends
        notes: String::new(),
        voice_analysis: VoiceAnalysis {
            pitch: 0.0,
            tempo: 0.0,
            emotion: "neutral".to_string(),
            stress_indicators: vec![],
        },
    };
    
    THERAPY_SESSIONS.with(|sessions| {
        let mut sessions = sessions.borrow_mut();
        sessions.insert(session_id.clone(), session);
    });
    
    Ok(session_id)
}

#[update]
pub fn end_therapy_session(
    session_id: String,
    duration: u32,
    stress_level_after: f32,
    notes: String,
    pitch: f32,
    tempo: f32,
) -> Result<TherapySession, String> {
    let caller_principal = require_auth()?;
    
    THERAPY_SESSIONS.with(|sessions| {
        let mut sessions = sessions.borrow_mut();
        if let Some(mut session) = sessions.get(&session_id) {
            if session.user_principal != caller_principal {
                return Err("Unauthorized access to session".to_string());
            }
            
            session.duration = duration;
            session.stress_level_after = stress_level_after;
            session.notes = notes;
            session.voice_analysis = VoiceAnalysis {
                pitch,
                tempo,
                emotion: analyze_voice_emotion(pitch, tempo).to_string(),
                stress_indicators: analyze_stress_indicators(pitch, tempo),
            };
            
            sessions.insert(session_id, session.clone());
            
            // Update user session count
            USER_PROFILES.with(|profiles| {
                let mut profiles = profiles.borrow_mut();
                if let Some(mut profile) = profiles.get(&caller_principal) {
                    profile.total_sessions += 1;
                    profile.last_active = get_current_time();
                    profiles.insert(caller_principal, profile);
                }
            });
            
            Ok(session)
        } else {
            Err("Session not found".to_string())
        }
    })
}

#[query]
pub fn get_user_sessions() -> Result<Vec<TherapySession>, String> {
    let caller_principal = require_auth()?;
    
    THERAPY_SESSIONS.with(|sessions| {
        let sessions = sessions.borrow();
        let user_sessions: Vec<TherapySession> = sessions
            .iter()
            .filter_map(|(_, session)| {
                if session.user_principal == caller_principal {
                    Some(session.clone())
                } else {
                    None
                }
            })
            .collect();
        
        Ok(user_sessions)
    })
}

#[query]
pub fn generate_user_progress_report() -> Result<ProgressReport, String> {
    let caller_principal = require_auth()?;
    
    let sessions = get_user_sessions()?;
    
    if sessions.is_empty() {
        return Err("No sessions found for user".to_string());
    }
    
    let total_sessions = sessions.len() as u32;
    let stress_reductions: Vec<f32> = sessions
        .iter()
        .map(|s| s.stress_level_before - s.stress_level_after)
        .collect();
    
    let avg_stress_reduction = stress_reductions.iter().sum::<f32>() / stress_reductions.len() as f32;
    
    let trend = if avg_stress_reduction > 2.0 {
        "Excellent progress".to_string()
    } else if avg_stress_reduction > 1.0 {
        "Good improvement".to_string()
    } else if avg_stress_reduction > 0.0 {
        "Gradual progress".to_string()
    } else {
        "Needs attention".to_string()
    };
    
    let mut recommendations = vec![];
    
    if avg_stress_reduction < 1.0 {
        recommendations.push("Consider longer therapy sessions".to_string());
        recommendations.push("Try different therapy types (EMDR vs CBT)".to_string());
    }
    
    if total_sessions < 5 {
        recommendations.push("Continue regular sessions for best results".to_string());
    }
    
    let recent_sessions = sessions.iter().rev().take(3).collect::<Vec<_>>();
    let recent_avg_stress = recent_sessions
        .iter()
        .map(|s| s.stress_level_after)
        .sum::<f32>() / recent_sessions.len() as f32;
    
    if recent_avg_stress > 6.0 {
        recommendations.push("Consider professional support for high stress levels".to_string());
    }
    
    Ok(ProgressReport {
        user_principal: caller_principal,
        total_sessions,
        avg_stress_reduction,
        trend,
        recommendations,
        generated_at: get_current_time(),
    })
}

// Voice Analysis Functions (Updated with authentication)
pub fn analyze_voice_emotion(pitch: f32, tempo: f32) -> &'static str {
    if pitch > 250.0 && tempo > 180.0 {
        "High stress"
    } else if pitch < 180.0 && tempo < 100.0 {
        "Possible depression"
    } else if pitch > 200.0 && tempo > 120.0 {
        "Anxiety"
    } else if pitch < 200.0 && tempo > 140.0 {
        "Agitation"
    } else {
        "Neutral"
    }
}

fn analyze_stress_indicators(pitch: f32, tempo: f32) -> Vec<String> {
    let mut indicators = vec![];
    
    if pitch > 300.0 {
        indicators.push("Very high pitch - extreme stress".to_string());
    } else if pitch > 250.0 {
        indicators.push("Elevated pitch - stress present".to_string());
    }
    
    if tempo > 200.0 {
        indicators.push("Very fast speech - anxiety".to_string());
    } else if tempo > 160.0 {
        indicators.push("Fast speech - nervousness".to_string());
    } else if tempo < 80.0 {
        indicators.push("Very slow speech - possible depression".to_string());
    }
    
    indicators
}

#[update]
pub fn get_cbt_reflection(thought: String) -> Result<String, String> {
    let _caller_principal = require_auth()?;
    
    let reflection = if thought.contains("I'm a failure") {
        "Try to reframe: Everyone fails sometimes. What did you learn from this experience?".to_string()
    } else if thought.contains("No one cares about me") {
        "Challenge that thought: Is that 100% true? What evidence do you have? Can you think of anyone who has shown they care?".to_string()
    } else if thought.contains("I can't do anything right") {
        "Question this all-or-nothing thinking: What is one thing you did well today, even if small?".to_string()
    } else if thought.contains("It's hopeless") {
        "Examine this thought: Have you felt hopeless before and things improved? What small step could you take today?".to_string()
    } else {
        "Reflect: Is this thought helping you or hurting you? How would you talk to a friend having this thought?".to_string()
    };
    
    Ok(reflection)
}

// Admin functions (for development/testing)
#[query]
pub fn get_total_users() -> u64 {
    USER_PROFILES.with(|profiles| profiles.borrow().len())
}

#[query]
pub fn get_total_sessions() -> u64 {
    THERAPY_SESSIONS.with(|sessions| sessions.borrow().len())
}

// Canister lifecycle
#[init]
fn init() {
    SESSION_COUNTER.with(|counter| {
        *counter.borrow_mut() = 0;
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // Stable memory is automatically preserved
}

#[post_upgrade]
fn post_upgrade() {
    // Stable memory is automatically restored
}

ic_cdk::export_candid!();

