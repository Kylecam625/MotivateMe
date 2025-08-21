'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VoiceSelector } from '@/components/VoiceSelector';
import { VOICE_OPTIONS } from '@/lib/voices';
import { Loader2, Sparkles, ChevronDown } from 'lucide-react';
import type { VoiceGender } from '@/types';

interface MotivationFormProps {
  onGenerate: (scenario: string, voiceId?: string) => void;
  isGenerating: boolean;
}

export function MotivationForm({ onGenerate, isGenerating }: MotivationFormProps) {
  const [scenario, setScenario] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
  const [showDropdown, setShowDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.trim() && !isGenerating) {
      console.log('=== MOTIVATION FORM SUBMIT ===');
      console.log('Selected voice ID:', selectedVoiceId);
      console.log('Scenario:', scenario.trim());
      console.log('=== END MOTIVATION FORM SUBMIT ===');
      onGenerate(scenario.trim(), selectedVoiceId);
    }
  };

  const exampleScenarios = [
    'Getting back into shape after years of being inactive',
    'Starting my own business despite the risks',
    'Learning a new skill at 40 years old',
    'Overcoming fear of public speaking',
    'Training for my first marathon',
    'Going back to school while working full-time',
  ];

  const handleExampleClick = (example: string) => {
    setScenario(example);
    setShowDropdown(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="compact-form">
      <div className="form-header">
        <h2 className="form-title font-pixel">Create Your Motivational Speech</h2>
        <p className="form-subtitle font-pixel">Share your challenge and get personalized motivation</p>
      </div>
      
      <form onSubmit={handleSubmit} className="form-content">
        {/* Scenario Input */}
        <div className="input-group">
          <Label htmlFor="scenario" className="input-label font-pixel">
            What do you need motivation for?
          </Label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="scenario"
                placeholder="Describe your situation, goal, or challenge in detail..."
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="compact-textarea font-pixel"
                disabled={isGenerating}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10"
                disabled={isGenerating}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-black/80 border border-white/20 rounded-lg backdrop-blur-sm max-h-60 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-white/70 mb-2 px-2 font-pixel">Choose an example:</p>
                  {exampleScenarios.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-2 text-sm rounded hover:bg-white/10 transition-colors font-pixel text-white/90 hover:text-white"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Voice Selection */}
        <div className="input-group">
          <Label className="input-label font-pixel">Choose Your Voice</Label>
          <VoiceSelector
            selectedVoiceId={selectedVoiceId}
            onVoiceChange={setSelectedVoiceId}
            disabled={isGenerating}
          />
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="compact-submit-btn font-pixel"
          disabled={!scenario.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Your Motivation...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Motivational Speech
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
