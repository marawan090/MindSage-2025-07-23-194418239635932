import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ProgressReport {
  'total_sessions' : number,
  'user_principal' : Principal,
  'trend' : string,
  'generated_at' : bigint,
  'recommendations' : Array<string>,
  'avg_stress_reduction' : number,
}
export type Result = { 'Ok' : TherapySession } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : ProgressReport } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : string } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : UserProfile } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : Array<TherapySession> } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : null } |
  { 'Err' : string };
export interface TherapySession {
  'id' : string,
  'user_principal' : Principal,
  'duration' : number,
  'stress_level_before' : number,
  'notes' : string,
  'timestamp' : bigint,
  'voice_analysis' : VoiceAnalysis,
  'stress_level_after' : number,
  'session_type' : string,
}
export interface UserProfile {
  'session_count' : number,
  'total_sessions' : number,
  'principal' : Principal,
  'username' : string,
  'created_at' : bigint,
  'last_active' : bigint,
}
export interface VoiceAnalysis {
  'tempo' : number,
  'emotion' : string,
  'stress_indicators' : Array<string>,
  'pitch' : number,
}
export interface _SERVICE {
  'end_therapy_session' : ActorMethod<
    [string, number, number, string, number, number],
    Result
  >,
  'generate_user_progress_report' : ActorMethod<[], Result_1>,
  'get_cbt_reflection' : ActorMethod<[string], Result_2>,
  'get_total_sessions' : ActorMethod<[], bigint>,
  'get_total_users' : ActorMethod<[], bigint>,
  'get_user_profile' : ActorMethod<[], Result_3>,
  'get_user_sessions' : ActorMethod<[], Result_4>,
  'register_user' : ActorMethod<[string], Result_3>,
  'start_therapy_session' : ActorMethod<[string, number], Result_2>,
  'update_last_active' : ActorMethod<[], Result_5>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
