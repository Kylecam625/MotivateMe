// Result types for error handling
export type Ok<T> = T extends void ? { ok: true } : { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export const Ok = <T>(value?: T extends void ? void : T): Ok<T> => {
  return (typeof value === 'undefined' ? { ok: true } : { ok: true, value }) as Ok<T>;
};

export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

// Audio timestamp types
export interface CharacterTimestamp {
  character: string;
  start_time: number;
  end_time: number;
}

export interface AudioTimestamps {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface SpeechWithTimestamps {
  audio_base64: string;
  alignment: AudioTimestamps;
  normalized_alignment: AudioTimestamps;
}

// Voice selection types
export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  description: string;
}

// Motivation types
export interface MotivationRequest {
  scenario: string;
  voiceGender?: VoiceGender;
  mood?: 'motivational' | 'energetic' | 'calm' | 'confident' | 'inspiring';
}

export interface GeneratedSpeech {
  id: string;
  scenario: string;
  rawText: string; // Text with ElevenLabs tags
  displayText: string; // Text without tags for display
  audioBase64?: string;
  timestamps?: AudioTimestamps;
  backgroundMusic?: string;
  createdAt: Date;
  status: 'generating' | 'complete' | 'error';
}

// Background music moods - updated to match available files
export type MusicMood = 'cool' | 'motivational' | 'sad' | 'sadminecraft' | 'happy' | 'energetic' | 'calm' | 'confident' | 'inspiring' | 'melancholy';

export interface BackgroundMusicMap {
  [key: string]: string;
}
