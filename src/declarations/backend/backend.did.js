export const idlFactory = ({ IDL }) => {
  const VoiceAnalysis = IDL.Record({
    'tempo' : IDL.Float32,
    'emotion' : IDL.Text,
    'stress_indicators' : IDL.Vec(IDL.Text),
    'pitch' : IDL.Float32,
  });
  const TherapySession = IDL.Record({
    'id' : IDL.Text,
    'user_principal' : IDL.Principal,
    'duration' : IDL.Nat32,
    'stress_level_before' : IDL.Float32,
    'notes' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'voice_analysis' : VoiceAnalysis,
    'stress_level_after' : IDL.Float32,
    'session_type' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : TherapySession, 'Err' : IDL.Text });
  const ProgressReport = IDL.Record({
    'total_sessions' : IDL.Nat32,
    'user_principal' : IDL.Principal,
    'trend' : IDL.Text,
    'generated_at' : IDL.Nat64,
    'recommendations' : IDL.Vec(IDL.Text),
    'avg_stress_reduction' : IDL.Float32,
  });
  const Result_1 = IDL.Variant({ 'Ok' : ProgressReport, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const UserProfile = IDL.Record({
    'session_count' : IDL.Nat32,
    'total_sessions' : IDL.Nat32,
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'created_at' : IDL.Nat64,
    'last_active' : IDL.Nat64,
  });
  const Result_3 = IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text });
  const Result_4 = IDL.Variant({
    'Ok' : IDL.Vec(TherapySession),
    'Err' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'end_therapy_session' : IDL.Func(
        [IDL.Text, IDL.Nat32, IDL.Float32, IDL.Text, IDL.Float32, IDL.Float32],
        [Result],
        [],
      ),
    'generate_user_progress_report' : IDL.Func([], [Result_1], ['query']),
    'get_cbt_reflection' : IDL.Func([IDL.Text], [Result_2], []),
    'get_total_sessions' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_total_users' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_user_profile' : IDL.Func([], [Result_3], ['query']),
    'get_user_sessions' : IDL.Func([], [Result_4], ['query']),
    'register_user' : IDL.Func([IDL.Text], [Result_3], []),
    'start_therapy_session' : IDL.Func([IDL.Text, IDL.Float32], [Result_2], []),
    'update_last_active' : IDL.Func([], [Result_5], []),
  });
};
export const init = ({ IDL }) => { return []; };
