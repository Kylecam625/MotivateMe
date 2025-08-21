'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, UserCheck, Play, Pause } from 'lucide-react';
import { VOICE_OPTIONS } from '@/lib/voices';
import type { VoiceGender } from '@/types';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({ selectedVoiceId, onVoiceChange, disabled = false }: VoiceSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handlePlaySample = (voiceName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent voice selection when clicking play button
    
    // Stop any currently playing audio
    if (playingVoice && audioRefs.current[playingVoice]) {
      audioRefs.current[playingVoice].pause();
      audioRefs.current[playingVoice].currentTime = 0;
    }

    if (playingVoice === voiceName) {
      // If clicking the same voice that's playing, stop it
      setPlayingVoice(null);
      return;
    }

    // Create or get audio element
    if (!audioRefs.current[voiceName]) {
      audioRefs.current[voiceName] = new Audio(`/voicesamples/${voiceName}.mp3`);
      audioRefs.current[voiceName].addEventListener('ended', () => {
        setPlayingVoice(null);
      });
    }

    // Play the new audio
    setPlayingVoice(voiceName);
    audioRefs.current[voiceName].play().catch(console.error);
  };

  return (
    <div className="voice-selector">
      {VOICE_OPTIONS.map((voice) => {
        const isSelected = selectedVoiceId === voice.id;
        const isPlaying = playingVoice === voice.name;
        
        return (
          <div
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`voice-option ${isSelected ? 'voice-selected' : ''} ${disabled ? 'disabled' : ''}`}
          >
            <div className="voice-header">
              {isSelected ? (
                <UserCheck className="voice-icon selected" />
              ) : (
                <User className="voice-icon" />
              )}
              <div className="voice-info">
                <h4 className="voice-name font-pixel">{voice.name}</h4>
                <p className="voice-type font-pixel">
                  {voice.gender === 'female' ? '👩' : '👨'} {voice.gender.charAt(0).toUpperCase() + voice.gender.slice(1)} Voice
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlaySample(voice.name, e)}
                disabled={disabled}
                className="voice-play-btn"
                title={`Play ${voice.name} sample`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <p className="voice-description font-pixel">{voice.description}</p>
            
            {isSelected && (
              <div className="voice-selected-indicator font-pixel">
                ✓ Selected for your speech
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
