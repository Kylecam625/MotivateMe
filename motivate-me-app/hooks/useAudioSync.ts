'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { RefObject } from 'react';
import { convertToWordTimestamps, getCurrentWordIndex } from '@/lib/elevenlabs';
import type { AudioTimestamps } from '@/types';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  characters: number[];
}

interface UseAudioSyncProps {
  displayText: string;
  timestamps: AudioTimestamps | undefined;
  isPlaying: boolean;
}

interface UseAudioSyncReturn {
  wordTimestamps: WordTimestamp[];
  currentWordIndex: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  highlightedText: React.ReactElement;
}

export function useAudioSync({ 
  displayText, 
  timestamps, 
  isPlaying 
}: UseAudioSyncProps): UseAudioSyncReturn {
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Process timestamps when text or timestamps change
  useEffect(() => {
    if (displayText && timestamps) {
      const words = convertToWordTimestamps(displayText, timestamps);
      setWordTimestamps(words);
    } else {
      setWordTimestamps([]);
    }
  }, [displayText, timestamps]);

  // Update current word based on audio time
  useEffect(() => {
    if (isPlaying && wordTimestamps.length > 0) {
      const wordIndex = getCurrentWordIndex(currentTime, wordTimestamps);
      setCurrentWordIndex(wordIndex);
    } else {
      setCurrentWordIndex(-1);
    }
  }, [currentTime, isPlaying, wordTimestamps]);

  // Animation frame for smooth updates
  useEffect(() => {
    if (isPlaying) {
      const updateTime = () => {
        // This would typically be called by the audio player
        // The actual time update is handled by the AudioPlayer component
        animationFrameRef.current = requestAnimationFrame(updateTime);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Generate highlighted text JSX
  const highlightedText = React.createElement(
    'div',
    { className: "text-lg leading-relaxed" },
    wordTimestamps.length === 0 
      ? React.createElement('span', null, displayText)
      : wordTimestamps.map((word, index) => {
          const isCurrent = isPlaying && index === currentWordIndex;
          const hasBeenSpoken = isPlaying && currentTime > word.end;
          
          return React.createElement(
            'span',
            {
              key: `${word.word}-${index}`,
              className: `
                inline-block mx-1 px-1 py-0.5 rounded transition-all duration-200
                ${isCurrent 
                  ? 'word-current bg-primary text-primary-foreground font-semibold transform scale-105 shadow-sm' 
                  : hasBeenSpoken 
                    ? 'text-muted-foreground opacity-70' 
                    : 'text-foreground hover:bg-accent/50'
                }
              `,
              style: {
                transitionDelay: isCurrent ? '0ms' : '100ms'
              }
            },
            word.word
          );
        })
  );

  return {
    wordTimestamps,
    currentWordIndex,
    currentTime,
    setCurrentTime,
    highlightedText,
  };
}

// Hook for managing background audio synchronization
export function useBackgroundAudioSync(
  isMainAudioPlaying: boolean,
  mood: string | null
): {
  isBackgroundEnabled: boolean;
  setIsBackgroundEnabled: (enabled: boolean) => void;
  isBackgroundPlaying: boolean;
  backgroundAudioRef: RefObject<HTMLAudioElement | null>;
} {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);

  // Handle background audio play/pause based on main audio
  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio || !isBackgroundEnabled) return;

    if (isMainAudioPlaying && !isBackgroundPlaying) {
      audio.play().then(() => {
        setIsBackgroundPlaying(true);
      }).catch(console.error);
    } else if (!isMainAudioPlaying && isBackgroundPlaying) {
      audio.pause();
      setIsBackgroundPlaying(false);
    }
  }, [isMainAudioPlaying, isBackgroundEnabled, isBackgroundPlaying]);

  // Load new background audio when mood changes
  useEffect(() => {
    if (!mood || !isBackgroundEnabled) return;

    const audioPath = `/audio/${mood}.mp3`;
    const newAudio = new Audio(audioPath);
    newAudio.loop = true;
    newAudio.volume = 0.3; // Background should be subtle
    
    // Replace current audio
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
    
    backgroundAudioRef.current = newAudio;
    
    // Auto-play if main audio is playing
    if (isMainAudioPlaying) {
      newAudio.play().then(() => {
        setIsBackgroundPlaying(true);
      }).catch(console.error);
    }
  }, [mood, isBackgroundEnabled, isMainAudioPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
    };
  }, []);

  return {
    isBackgroundEnabled,
    setIsBackgroundEnabled,
    isBackgroundPlaying,
    backgroundAudioRef,
  };
}
