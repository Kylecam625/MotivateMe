import type { MusicMood, BackgroundMusicMap } from '@/types';

// Available audio files in public/audio/ folder
export const AVAILABLE_AUDIO_FILES = [
  'cool.mp3',
  'motivational.mp3', 
  'sad.mp3',
  'sadminecraft.mp3'
];

// Map moods to actual audio file paths
export const BACKGROUND_MUSIC_MAP: BackgroundMusicMap = {
  cool: '/audio/cool.mp3',
  motivational: '/audio/motivational.mp3',
  sad: '/audio/sad.mp3',
  sadminecraft: '/audio/sadminecraft.mp3',
  // Fallback mappings for common moods to available files
  happy: '/audio/cool.mp3',
  energetic: '/audio/cool.mp3',
  confident: '/audio/motivational.mp3',
  inspiring: '/audio/motivational.mp3',
  calm: '/audio/sad.mp3',
  melancholy: '/audio/sadminecraft.mp3',
};

/**
 * Get background music file path for a given mood
 */
export function getBackgroundMusicPath(mood: MusicMood): string {
  return BACKGROUND_MUSIC_MAP[mood] || BACKGROUND_MUSIC_MAP.motivational;
}

/**
 * Preload background music for better performance
 */
export function preloadBackgroundMusic(mood: MusicMood): HTMLAudioElement {
  const audio = new Audio();
  audio.src = getBackgroundMusicPath(mood);
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0.3; // Background music should be subtle
  return audio;
}

/**
 * Fade in audio element
 */
export function fadeInAudio(audio: HTMLAudioElement, duration: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    const targetVolume = 0.3;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    
    audio.volume = 0;
    audio.play().catch(console.error);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        resolve();
      }
    }, stepDuration);
  });
}

/**
 * Fade out audio element
 */
export function fadeOutAudio(audio: HTMLAudioElement, duration: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
      
      if (currentStep >= steps || audio.volume <= 0) {
        clearInterval(interval);
        audio.pause();
        audio.volume = 0;
        resolve();
      }
    }, stepDuration);
  });
}

/**
 * Cross-fade between two audio elements
 */
export async function crossFadeAudio(
  fromAudio: HTMLAudioElement | null, 
  toAudio: HTMLAudioElement,
  duration: number = 2000
): Promise<void> {
  const promises: Promise<void>[] = [];
  
  // Fade out current audio if it exists
  if (fromAudio && !fromAudio.paused) {
    promises.push(fadeOutAudio(fromAudio, duration));
  }
  
  // Fade in new audio
  promises.push(fadeInAudio(toAudio, duration));
  
  await Promise.all(promises);
}
