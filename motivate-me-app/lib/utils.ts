import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AudioTimestamps } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Strip ElevenLabs V3 audio tags from text for display
export function stripAudioTags(text: string): string {
  return text.replace(/\[[\w\s]+\]/g, '').replace(/\s+/g, ' ').trim();
}

// Extract words from text for highlighting
export function extractWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}

// Format time in seconds to MM:SS format
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Build display text directly from ElevenLabs timestamps to ensure 1:1 mapping
export function timestampsToText(timestamps: AudioTimestamps | undefined): string {
  if (!timestamps || !Array.isArray(timestamps.characters)) return '';
  // Join characters, strip audio tags, and normalize whitespace
  const rawText = timestamps.characters.join('');
  return stripAudioTags(rawText);
}
