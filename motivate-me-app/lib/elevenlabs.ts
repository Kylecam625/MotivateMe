import { env } from './env';
import { getDefaultVoiceId } from './voices';
import { Result, Ok, Err } from '@/types';
import type { SpeechWithTimestamps, AudioTimestamps } from '@/types';

/**
 * Generate speech with character-level timestamps using ElevenLabs V3
 * Based on @APIDOCS/elevenlabs/createspeechtimestamps.md
 * Uses direct fetch to ElevenLabs API (server-side only)
 */
export async function generateSpeechWithTimestamps(
  text: string,
  voiceId: string = getDefaultVoiceId()
): Promise<Result<SpeechWithTimestamps>> {
  try {
    console.log('=== ELEVENLABS REQUEST DEBUGGING ===');
    console.log('Input text length:', text.length);
    console.log('Input text preview:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    console.log('Voice ID:', voiceId);
    console.log('Model:', env.ELEVENLABS_MODEL);
    console.log('API Key present:', !!env.ELEVENLABS_API_KEY);
    console.log('API Key length:', env.ELEVENLABS_API_KEY?.length);
    console.log('API Key starts with:', env.ELEVENLABS_API_KEY?.substring(0, 10) + '...');
    
    const requestBody = {
      text: text,
      model_id: env.ELEVENLABS_MODEL,
      voice_settings: {
        stability: 0.0, // Creative setting for V3 expressiveness (0.0 = Creative, 0.5 = Natural, 1.0 = Robust)
        similarity_boost: 0.75,
        style: 0.6, // Higher style for better emotional delivery with V3 tags
        use_speaker_boost: true,
      },
      // Enable optimizations for better quality
      apply_text_normalization: 'auto',
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Request URL:', `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`);
    
    // Use the with-timestamps endpoint for character-level timing
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('ElevenLabs response status:', response.status);
    console.log('ElevenLabs response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error response:', errorText);
      return Err(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('ElevenLabs response data keys:', Object.keys(data));
    console.log('ElevenLabs response data:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (!data.audio_base64 || !data.alignment) {
      console.error('Missing required fields in ElevenLabs response:', {
        hasAudioBase64: !!data.audio_base64,
        hasAlignment: !!data.alignment,
        dataKeys: Object.keys(data),
      });
      return Err('Invalid response from ElevenLabs API - missing required fields');
    }

    console.log('ElevenLabs audio generation successful:', {
      audioLength: data.audio_base64?.length,
      alignmentCharacters: data.alignment?.characters?.length,
      hasNormalizedAlignment: !!data.normalized_alignment,
    });
    console.log('=== END ELEVENLABS DEBUGGING ===');

    return Ok({
      audio_base64: data.audio_base64,
      alignment: data.alignment,
      normalized_alignment: data.normalized_alignment || data.alignment,
    });
  } catch (error) {
    console.error('=== ELEVENLABS ERROR ===');
    console.error('ElevenLabs API error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('=== END ELEVENLABS ERROR ===');
    return Err(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



/**
 * Convert character-level timestamps to word-level for easier highlighting
 * Handles mapping between original text (with tags) and display text (without tags)
 */
export function convertToWordTimestamps(
  displayText: string,
  timestamps: AudioTimestamps
): Array<{ word: string; start: number; end: number; characters: number[] }> {
  const words = displayText.split(/\s+/).filter(word => word.length > 0);
  const wordTimestamps: Array<{ word: string; start: number; end: number; characters: number[] }> = [];
  
  // Reconstruct original text from timestamps
  const originalText = timestamps.characters.join('');
  
  // Create mapping from display text positions to original text positions
  const displayToOriginalMapping: number[] = [];
  let originalIndex = 0;
  let displayIndex = 0;
  
  while (originalIndex < originalText.length) {
    const char = originalText[originalIndex];
    
    // Check if we're at the start of a tag
    if (char === '[') {
      // Find the end of the tag
      let tagEnd = originalIndex;
      while (tagEnd < originalText.length && originalText[tagEnd] !== ']') {
        tagEnd++;
      }
      if (tagEnd < originalText.length) {
        // Skip the entire tag including the closing bracket
        originalIndex = tagEnd + 1;
        continue;
      }
    }
    
    // Map this character position
    displayToOriginalMapping[displayIndex] = originalIndex;
    displayIndex++;
    originalIndex++;
  }
  
  // Now map words using the position mapping
  let displayCharIndex = 0;
  
  for (const word of words) {
    // Skip whitespace in display text
    while (displayCharIndex < displayText.length && displayText[displayCharIndex] === ' ') {
      displayCharIndex++;
    }
    
    if (displayCharIndex >= displayText.length) break;
    
    const wordStartDisplay = displayCharIndex;
    const wordEndDisplay = displayCharIndex + word.length - 1;
    
    // Map to original character indices
    const characterIndices: number[] = [];
    for (let i = wordStartDisplay; i <= wordEndDisplay && i < displayToOriginalMapping.length; i++) {
      const originalIdx = displayToOriginalMapping[i];
      if (originalIdx !== undefined && originalIdx < timestamps.characters.length) {
        characterIndices.push(originalIdx);
      }
    }
    
    if (characterIndices.length > 0) {
      const startTime = timestamps.character_start_times_seconds[characterIndices[0]] || 0;
      const endTime = timestamps.character_end_times_seconds[characterIndices[characterIndices.length - 1]] || startTime;
      
      wordTimestamps.push({
        word,
        start: startTime,
        end: endTime,
        characters: characterIndices,
      });
    }
    
    displayCharIndex += word.length;
  }
  
  return wordTimestamps;
}

/**
 * Find the current word being spoken based on audio time
 */
export function getCurrentWordIndex(
  currentTime: number,
  wordTimestamps: Array<{ word: string; start: number; end: number }>
): number {
  for (let i = 0; i < wordTimestamps.length; i++) {
    const word = wordTimestamps[i];
    if (currentTime >= word.start && currentTime <= word.end) {
      return i;
    }
  }
  
  // If not in any word, find the closest upcoming word
  for (let i = 0; i < wordTimestamps.length; i++) {
    if (currentTime < wordTimestamps[i].start) {
      return Math.max(0, i - 1);
    }
  }
  
  // If past all words, return the last word
  return Math.max(0, wordTimestamps.length - 1);
}
