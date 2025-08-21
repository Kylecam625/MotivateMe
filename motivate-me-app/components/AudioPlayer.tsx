'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { getBackgroundMusicPath } from '@/lib/background-audio';
import type { GeneratedSpeech, MusicMood } from '@/types';

interface AudioPlayerProps {
  speech: GeneratedSpeech;
  onTimeUpdate: (currentTime: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onDurationChange?: (duration: number) => void;
  isPlaying: boolean;
  currentTime: number;
  backgroundMood?: MusicMood;
}

export function AudioPlayer({ 
  speech, 
  onTimeUpdate, 
  onPlayStateChange, 
  onDurationChange,
  isPlaying,
  currentTime,
  backgroundMood = 'motivational'
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundFadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState(0);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [backgroundVolume, setBackgroundVolume] = useState(0.3);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isBackgroundMuted, setIsBackgroundMuted] = useState(false);
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
  const [fadeMultiplier, setFadeMultiplier] = useState(1.0); // For fade out effect
  const [isBackgroundOutro, setIsBackgroundOutro] = useState(false); // Track background outro period
  const [outroProgress, setOutroProgress] = useState(0); // Track outro progress (0-2 seconds)

  // Create speech audio element when speech changes
  useEffect(() => {
    if (speech.audioBase64) {
      console.log('=== CREATING SPEECH AUDIO ===');
      console.log('Audio base64 length:', speech.audioBase64.length);
      
      const audio = new Audio(`data:audio/wav;base64,${speech.audioBase64}`);
      audio.volume = isSpeechMuted ? 0 : speechVolume; // Set initial volume
      audioRef.current = audio;
      
      console.log('Speech audio element created:', {
        volume: audio.volume,
        muted: audio.muted,
        readyState: audio.readyState
      });

      const handleTimeUpdate = () => {
        const time = audio.currentTime;
        const duration = audio.duration;
        
        // No voice fade - speech plays at full volume until it ends
        // Background audio will fade during its outro period
        
        onTimeUpdate(time);
      };

      const handleLoadedMetadata = () => {
        console.log('Speech audio metadata loaded:', {
          duration: audio.duration,
          volume: audio.volume,
          readyState: audio.readyState
        });
        setDuration(audio.duration);
        if (onDurationChange) {
          onDurationChange(audio.duration);
        }
      };

      const handleEnded = () => {
        console.log('Speech audio ended');
        
        // Let background music continue and fade out for 2 more seconds after speech ends
        if (backgroundAudioRef.current && !backgroundAudioRef.current.paused) {
          console.log('Speech ended, fading out background music for 2 more seconds');
          setIsBackgroundOutro(true);
          
          // Start background fade out
          let fadeTime = 0;
          backgroundFadeIntervalRef.current = setInterval(() => {
            fadeTime += 50; // Update every 50ms
            const fadeProgress = Math.max(0, 1 - (fadeTime / 2000)); // Fade from 1.0 to 0.0 over 2 seconds
            
            // Update outro progress for progress bar
            setOutroProgress(Math.min(2, fadeTime / 1000)); // Convert to seconds (0-2)
            
            if (backgroundAudioRef.current) {
              const baseVolume = isBackgroundMuted ? 0 : backgroundVolume;
              backgroundAudioRef.current.volume = baseVolume * fadeProgress;
            }
            
            if (fadeTime >= 2000) {
              if (backgroundFadeIntervalRef.current) {
                clearInterval(backgroundFadeIntervalRef.current);
                backgroundFadeIntervalRef.current = null;
              }
              console.log('Background music outro complete, stopping playback');
              if (backgroundAudioRef.current) {
                backgroundAudioRef.current.pause();
              }
              setIsBackgroundOutro(false);
              setOutroProgress(0); // Reset outro progress
              setFadeMultiplier(1.0); // Reset fade multiplier
              onPlayStateChange(false);
              onTimeUpdate(0);
            }
          }, 50);
        } else {
          // If no background music, stop immediately
          setFadeMultiplier(1.0); // Reset fade multiplier
          onPlayStateChange(false);
          onTimeUpdate(0);
        }
      };

      const handleError = (e: Event) => {
        console.error('Speech audio error:', e);
      };

      const handleCanPlay = () => {
        console.log('Speech audio can play');
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);

      console.log('=== END CREATING SPEECH AUDIO ===');

      return () => {
        console.log('Cleaning up speech audio');
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.pause();
      };
    }
  }, [speech.audioBase64, onTimeUpdate, onPlayStateChange]); // Removed volume dependencies to prevent recreation

  // Create background audio element when mood changes
  useEffect(() => {
    if (backgroundMood && isBackgroundEnabled) {
      console.log('=== CREATING BACKGROUND AUDIO ===');
      console.log('Background mood:', backgroundMood);
      console.log('Background enabled:', isBackgroundEnabled);
      
      const backgroundPath = getBackgroundMusicPath(backgroundMood);
      console.log('Background path:', backgroundPath);
      
      const backgroundAudio = new Audio(backgroundPath);
      backgroundAudio.loop = true;
      backgroundAudio.volume = isBackgroundMuted ? 0 : backgroundVolume;
      
      console.log('Background audio element created:', {
        volume: backgroundAudio.volume,
        loop: backgroundAudio.loop,
        src: backgroundAudio.src
      });
      
      // Replace current background audio
      if (backgroundAudioRef.current) {
        console.log('Pausing previous background audio');
        backgroundAudioRef.current.pause();
      }
      backgroundAudioRef.current = backgroundAudio;
      console.log('=== END CREATING BACKGROUND AUDIO ===');
    }
  }, [backgroundMood, isBackgroundEnabled]); // Removed volume dependencies to prevent recreation

  // Handle play/pause state changes for both audio streams
  useEffect(() => {
    const speechAudio = audioRef.current;
    const backgroundAudio = backgroundAudioRef.current;
    
    console.log('=== PLAY/PAUSE STATE CHANGE ===');
    console.log('Is playing:', isPlaying);
    console.log('Speech audio exists:', !!speechAudio);
    console.log('Background audio exists:', !!backgroundAudio);
    console.log('Background enabled:', isBackgroundEnabled);
    
    if (!speechAudio) {
      console.log('No speech audio, returning');
      return;
    }

    if (isPlaying) {
      console.log('Starting speech audio playback');
      speechAudio.play().then(() => {
        console.log('Speech audio started successfully');
      }).catch((error) => {
        console.error('Failed to start speech audio:', error);
      });
      
      // Start background audio synchronized with speech
      if (backgroundAudio && isBackgroundEnabled) {
        console.log('Starting background audio playback');
        backgroundAudio.currentTime = speechAudio.currentTime;
        backgroundAudio.play().then(() => {
          console.log('Background audio started successfully');
        }).catch((error) => {
          console.error('Failed to start background audio:', error);
        });
      }
    } else {
      console.log('Pausing speech audio');
      speechAudio.pause();
      // Pause background audio as well
      if (backgroundAudio) {
        console.log('Pausing background audio');
        backgroundAudio.pause();
      }
    }
    console.log('=== END PLAY/PAUSE STATE CHANGE ===');
  }, [isPlaying, isBackgroundEnabled]);

  // Sync audio position with external currentTime prop
  useEffect(() => {
    const speechAudio = audioRef.current;
    if (speechAudio && Math.abs(speechAudio.currentTime - currentTime) > 0.5) {
      speechAudio.currentTime = currentTime;
      
      // Keep background audio synced
      const backgroundAudio = backgroundAudioRef.current;
      if (backgroundAudio && isBackgroundEnabled) {
        backgroundAudio.currentTime = currentTime % backgroundAudio.duration;
      }
    }
  }, [currentTime, isBackgroundEnabled]);

  // Handle speech volume changes (no fade - full volume until end)
  useEffect(() => {
    const speechAudio = audioRef.current;
    if (speechAudio) {
      console.log('=== SPEECH VOLUME DEBUG ===');
      const finalVolume = isSpeechMuted ? 0 : speechVolume;
      console.log('Setting speech volume to:', finalVolume);
      console.log('Speech audio current state:', {
        paused: speechAudio.paused,
        currentTime: speechAudio.currentTime,
        duration: speechAudio.duration,
        readyState: speechAudio.readyState
      });
      speechAudio.volume = finalVolume;
      console.log('Speech audio volume set to:', speechAudio.volume);
      console.log('=== END SPEECH VOLUME DEBUG ===');
    }
  }, [speechVolume, isSpeechMuted]);

  // Handle background volume changes (no fade - continues at full volume)
  useEffect(() => {
    const backgroundAudio = backgroundAudioRef.current;
    if (backgroundAudio) {
      console.log('=== BACKGROUND VOLUME DEBUG ===');
      const finalVolume = isBackgroundMuted ? 0 : backgroundVolume;
      console.log('Setting background volume to:', finalVolume);
      console.log('Background audio current state:', {
        paused: backgroundAudio.paused,
        currentTime: backgroundAudio.currentTime,
        duration: backgroundAudio.duration,
        readyState: backgroundAudio.readyState
      });
      backgroundAudio.volume = finalVolume;
      console.log('Background audio volume set to:', backgroundAudio.volume);
      console.log('=== END BACKGROUND VOLUME DEBUG ===');
    }
  }, [backgroundVolume, isBackgroundMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up background fade interval
      if (backgroundFadeIntervalRef.current) {
        clearInterval(backgroundFadeIntervalRef.current);
        backgroundFadeIntervalRef.current = null;
      }
      // Clean up background audio
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = () => {
    console.log('=== PLAY/PAUSE BUTTON CLICKED ===');
    console.log('Current playing state:', isPlaying);
    console.log('Will change to:', !isPlaying);
    console.log('Speech audio exists:', !!audioRef.current);
    console.log('Background audio exists:', !!backgroundAudioRef.current);
    onPlayStateChange(!isPlaying);
    console.log('=== END PLAY/PAUSE BUTTON CLICKED ===');
  };

  const handleRestart = () => {
    const speechAudio = audioRef.current;
    const backgroundAudio = backgroundAudioRef.current;
    
    // Clean up any ongoing background fade
    if (backgroundFadeIntervalRef.current) {
      clearInterval(backgroundFadeIntervalRef.current);
      backgroundFadeIntervalRef.current = null;
    }
    
    if (speechAudio) {
      speechAudio.currentTime = 0;
      setFadeMultiplier(1.0); // Reset fade multiplier for restart
      setIsBackgroundOutro(false); // Reset background outro state
      setOutroProgress(0); // Reset outro progress
      onTimeUpdate(0);
      
      // Sync background audio to beginning as well and reset volume
      if (backgroundAudio && isBackgroundEnabled) {
        backgroundAudio.currentTime = 0;
        backgroundAudio.volume = isBackgroundMuted ? 0 : backgroundVolume; // Reset to normal volume
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const speechAudio = audioRef.current;
    const backgroundAudio = backgroundAudioRef.current;
    
    if (!speechAudio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    speechAudio.currentTime = newTime;
    onTimeUpdate(newTime);
    
    // Keep background audio synced
    if (backgroundAudio && isBackgroundEnabled) {
      backgroundAudio.currentTime = newTime % backgroundAudio.duration;
    }
  };

  const toggleSpeechMute = () => {
    setIsSpeechMuted(!isSpeechMuted);
  };

  const toggleBackgroundMute = () => {
    setIsBackgroundMuted(!isBackgroundMuted);
  };

  const handleSpeechVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    console.log('=== SPEECH VOLUME CHANGE ===');
    console.log('New speech volume:', newVolume);
    console.log('Previous speech volume:', speechVolume);
    console.log('Current speech audio ref:', !!audioRef.current);
    console.log('Is speech muted:', isSpeechMuted);
    
    setSpeechVolume(newVolume);
    if (newVolume > 0) {
      console.log('Unmuting speech due to volume > 0');
      setIsSpeechMuted(false);
    }
    console.log('=== END SPEECH VOLUME CHANGE ===');
  };

  const handleBackgroundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    console.log('=== BACKGROUND VOLUME CHANGE ===');
    console.log('New background volume:', newVolume);
    console.log('Previous background volume:', backgroundVolume);
    console.log('Current background audio ref:', !!backgroundAudioRef.current);
    console.log('Is background muted:', isBackgroundMuted);
    console.log('Is background enabled:', isBackgroundEnabled);
    
    setBackgroundVolume(newVolume);
    if (newVolume > 0) {
      console.log('Unmuting background due to volume > 0');
      setIsBackgroundMuted(false);
    }
    console.log('=== END BACKGROUND VOLUME CHANGE ===');
  };

  const toggleBackgroundEnabled = () => {
    const newEnabled = !isBackgroundEnabled;
    setIsBackgroundEnabled(newEnabled);
    
    // If disabling, pause background audio
    if (!newEnabled && backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
    // If enabling and speech is playing, start background audio
    else if (newEnabled && isPlaying && backgroundAudioRef.current) {
      const speechAudio = audioRef.current;
      if (speechAudio) {
        backgroundAudioRef.current.currentTime = speechAudio.currentTime % backgroundAudioRef.current.duration;
        backgroundAudioRef.current.play().catch(console.error);
      }
    }
  };

  // Calculate progress including the 2-second background outro
  const totalDuration = duration + 2; // Add 2 seconds for background outro
  let effectiveCurrentTime = currentTime;
  
  // During background outro, add the outro progress to show continued progress
  if (isBackgroundOutro && duration > 0) {
    effectiveCurrentTime = duration + outroProgress; // Speech duration + outro progress (0-2 seconds)
  }
  
  const progressPercentage = totalDuration > 0 ? (effectiveCurrentTime / totalDuration) * 100 : 0;

  return (
    <div className="premium-audio-player">
      {/* Progress Bar - moved to top */}
      <div className="premium-progress-container" onClick={handleSeek}>
        <div className="premium-progress-track">
          <div 
            className="premium-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="premium-progress-thumb" />
          </div>
          <div className="premium-progress-glow" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="premium-controls-row">
        {/* Left: Time Display */}
        <div className="premium-time-display">
          <span className="time-current">{formatTime(effectiveCurrentTime)}</span>
          <span className="time-separator">/</span>
          <span className="time-total">{formatTime(duration + 2)}</span>
        </div>

        {/* Center: Playback Controls */}
        <div className="premium-playback-controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            disabled={!speech.audioBase64}
            className="premium-control-btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={!speech.audioBase64}
            className="premium-play-btn"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBackgroundEnabled}
            disabled={!speech.audioBase64}
            className={`premium-control-btn ${isBackgroundEnabled ? 'active' : ''}`}
          >
            <Music className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Right: Volume Controls */}
        <div className="premium-volume-controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeechMute}
            disabled={!speech.audioBase64}
            className="premium-volume-btn"
          >
            {isSpeechMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
          
          <div className="premium-volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={speechVolume}
              onChange={handleSpeechVolumeChange}
              className="premium-volume-slider"
              disabled={!speech.audioBase64}
            />
          </div>
          
          <span className="premium-volume-text">{Math.round(speechVolume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

