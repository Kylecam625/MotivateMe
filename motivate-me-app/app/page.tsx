'use client';

import { useState, useCallback } from 'react';
import { MotivationForm } from '@/components/MotivationForm';
import { TextDisplay } from '@/components/TextDisplay';
import { AudioPlayer } from '@/components/AudioPlayer';

import { LoadingEffect } from '@/components/LoadingEffect';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Sparkles, Zap } from 'lucide-react';
import type { GeneratedSpeech } from '@/types';

export default function HomePage() {
  const [currentSpeech, setCurrentSpeech] = useState<GeneratedSpeech | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleGenerate = useCallback(async (scenario: string, voiceId?: string) => {
    setIsGenerating(true);
    setError(null);
    setCurrentScenario(scenario);
    setLoadingStep(0);

    try {
      // Step 1: Analyzing scenario
      setLoadingStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Making API request (crafting content + audio tags happen server-side)
      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Generating audio
      setLoadingStep(3);
      
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario, voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const speech: GeneratedSpeech = await response.json();
      
      // Brief pause to show completion of final step
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentSpeech(speech);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
      setLoadingStep(0);
    }
  }, []);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setAudioCurrentTime(currentTime);
  }, []);

  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsAudioPlaying(isPlaying);
  }, []);

  const handleDurationChange = useCallback((duration: number) => {
    setAudioDuration(duration);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsAudioPlaying(!isAudioPlaying);
  }, [isAudioPlaying]);

  const handleRestart = useCallback(() => {
    setAudioCurrentTime(0);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setAudioCurrentTime(time);
  }, []);

  const handleBack = () => {
    setCurrentSpeech(null);
    setAudioCurrentTime(0);
    setIsAudioPlaying(false);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen relative">

      
      {/* Premium Layout */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Clean Header */}
        <header className={`text-center mb-6 transition-opacity duration-500 ${
          isAudioPlaying ? 'opacity-50' : 'opacity-100'
        }`}>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-pixel">
            <span className="text-foreground">Motivate Me,</span>
            <span className="text-primary"> Or Not?</span>
          </h1>
        </header>

        {/* Error Display */}
        {error && (
          <div className={`mb-8 transition-opacity duration-500 ${
            isAudioPlaying ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="premium-card border-destructive/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-destructive mb-1">
                    Generation Failed
                  </h3>
                  <p className="text-destructive/80 text-sm leading-relaxed">
                    {error}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main>
          {isGenerating ? (
            <LoadingEffect scenario={currentScenario} currentStep={loadingStep} />
          ) : !currentSpeech ? (
            <MotivationForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          ) : (
            <div className="space-y-4">
              {/* Navigation */}
              <div className={`flex justify-between items-center relative z-30 transition-opacity duration-500 ${
                isAudioPlaying ? 'opacity-50' : 'opacity-100'
              }`}>
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground font-pixel"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Form</span>
                </Button>
              </div>

              {/* Connected Speech Display and Audio Player */}
              <div className={`connected-player-container relative z-30 ${
                isAudioPlaying ? 'focus-mode' : ''
              }`}>
                <TextDisplay 
                  speech={currentSpeech}
                  currentTime={audioCurrentTime}
                  isPlaying={isAudioPlaying}
                />

                <div className={`transition-opacity duration-500 ${
                  isAudioPlaying ? 'opacity-50' : 'opacity-100'
                }`}>
                  <AudioPlayer
                    speech={currentSpeech}
                    onTimeUpdate={handleTimeUpdate}
                    onPlayStateChange={handlePlayStateChange}
                    onDurationChange={handleDurationChange}
                    isPlaying={isAudioPlaying}
                    backgroundMood={currentSpeech.backgroundMusic as any}
                    currentTime={audioCurrentTime}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer removed per design request */}
      </div>
    </div>
  );
}
