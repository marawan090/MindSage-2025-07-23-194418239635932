pub fn analyze_voice_emotion(pitch: f32, tempo: f32) -> &'static str {
    if pitch > 250.0 && tempo > 180.0 {
        "High stress"
    } else if pitch < 180.0 && tempo < 100.0 {
        "Possible depression"
    } else {
        "Neutral"
    }
}

pub fn estimate_trauma_severity(words: &[&str]) -> &'static str {
    let trauma_keywords = ["death", "abuse", "violence", "accident", "panic"];
    let mut score = 0;
    
    for word in words {
        if trauma_keywords.contains(word) {
            score += 1;
        }
    }

    match score {
        0 => "Low severity",
        1..=2 => "Moderate severity",
        _ => "High severity",
    }
}

pub fn generate_progress_report(sessions: u32, stress_levels: &[f32]) -> String {
    let avg_stress: f32 = stress_levels.iter().sum::<f32>() / stress_levels.len() as f32;
    let trend = if avg_stress < 3.0 {
        "Improving"
    } else if avg_stress < 6.0 {
        "Stable"
    } else {
        "Needs attention"
    };

    format!("Sessions: {sessions}, Avg Stress: {avg_stress:.2} — {trend}")
}

pub fn cbt_reflection(thought: &str) -> String {
    if thought.contains("I'm a failure") {
        "Try to reframe: Everyone fails sometimes. What did you learn?".to_string()
    } else if thought.contains("No one cares about me") {
        "Challenge that thought: Is that 100% true? What evidence do you have?".to_string()
    } else {
        "Reflect: Is this thought helping you or hurting you?".to_string()
    }
}
ic_cdk::export_candid!();

