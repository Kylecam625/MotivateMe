import type { VoiceOption, VoiceGender } from '@/types';

// Voice IDs that match the environment configuration
// These must match the values in env.ts and .env files
const DEFAULT_FEMALE_VOICE_ID = 'kdmDKE6EkgrWrrykO9Qt'; // Female voice ID (Alexandra)
const DEFAULT_MALE_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ'; // Male voice ID (Liam)

// Available voice options
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: DEFAULT_FEMALE_VOICE_ID,
    name: 'Alexandra',
    gender: 'female',
    description: 'Cute and sweet type voice',
  },
  {
    id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    gender: 'female',
    description: 'Sensual and raspy',
  },
  {
    id: DEFAULT_MALE_VOICE_ID,
    name: 'Liam',
    gender: 'male', 
    description: 'A young adult with energy',
  },
  {
    id: 'EkK5I93UQWFDigLMpZcX',
    name: 'James',
    gender: 'male',
    description: 'Husky & engaging with a slightly bassy voice',
  },
];

/**
 * Get voice ID by gender preference
 */
export function getVoiceIdByGender(gender: VoiceGender): string {
  const voiceId = gender === 'male' ? DEFAULT_MALE_VOICE_ID : DEFAULT_FEMALE_VOICE_ID;
  console.log('=== VOICE SELECTION DEBUG ===');
  console.log('Requested gender:', gender);
  console.log('Available female voice ID:', DEFAULT_FEMALE_VOICE_ID);
  console.log('Available male voice ID:', DEFAULT_MALE_VOICE_ID);
  console.log('Selected voice ID:', voiceId);
  console.log('=== END VOICE SELECTION DEBUG ===');
  return voiceId;
}

/**
 * Get voice option by ID
 */
export function getVoiceOptionById(voiceId: string): VoiceOption | undefined {
  return VOICE_OPTIONS.find(voice => voice.id === voiceId);
}

/**
 * Get voice option by gender
 */
export function getVoiceOptionByGender(gender: VoiceGender): VoiceOption {
  return VOICE_OPTIONS.find(voice => voice.gender === gender) || VOICE_OPTIONS[0];
}

/**
 * Get default voice ID (female by default)
 */
export function getDefaultVoiceId(): string {
  return DEFAULT_FEMALE_VOICE_ID;
}
