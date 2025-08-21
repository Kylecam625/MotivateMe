'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Zap, Brain, Mic } from 'lucide-react';

interface LoadingEffectProps {
  scenario: string;
  currentStep?: number;
}

export function LoadingEffect({ scenario, currentStep: propCurrentStep }: LoadingEffectProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentStep = propCurrentStep !== undefined ? propCurrentStep : internalStep;

  const steps = [
    { icon: Brain, text: 'Analyzing scenario', subtext: 'Understanding your motivation needs', color: 'from-blue-400 to-cyan-400' },
    { icon: Sparkles, text: 'Crafting content', subtext: 'Building personalized motivation', color: 'from-yellow-400 to-orange-400' },
    { icon: Zap, text: 'Adding emotion', subtext: 'Enhancing with audio cues', color: 'from-purple-400 to-pink-400' },
    { icon: Mic, text: 'Generating audio', subtext: 'Creating synchronized speech', color: 'from-green-400 to-emerald-400' },
  ];

  // Smooth progress animation - more gradual
  useEffect(() => {
    const targetProgress = ((currentStep + 1) / steps.length) * 100;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) return targetProgress;
        return prev + diff * 0.08; // Slower, smoother progress
      });
    }, 50);
    return () => clearInterval(progressInterval);
  }, [currentStep, steps.length]);

  // Auto-cycle steps with transition effect - better timing
  useEffect(() => {
    if (propCurrentStep === undefined) {
      const stepInterval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setInternalStep(prev => (prev + 1) % steps.length);
          setIsTransitioning(false);
        }, 300);
      }, 4000); // Slower, more even timing
      return () => clearInterval(stepInterval);
    }
  }, [propCurrentStep, steps.length]);

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="loading-compact-container">
      <div className="loading-compact-card">
        {/* Header with scenario */}
        <div className="loading-compact-header">
          <div className="loading-compact-scenario">
            <p>"{scenario}"</p>
          </div>
        </div>

        {/* Main content area with sliding effect */}
        <div className="loading-compact-main">
          <div className={`loading-compact-content ${isTransitioning ? 'loading-compact-transitioning' : ''}`}>
            {/* Central icon with animation */}
            <div className="loading-compact-icon-container">
              <div className="loading-compact-icon-wrapper">
                <div className="loading-compact-icon-bg">
                  <IconComponent className="loading-compact-icon" />
                </div>
                <div className="loading-compact-icon-ring"></div>
                <div className="loading-compact-icon-ring loading-compact-icon-ring-delayed"></div>
              </div>
            </div>

            {/* Step info */}
            <div className="loading-compact-step-info">
              <h3 className="loading-compact-step-title">
                {currentStepData.text}
              </h3>
              <p className="loading-compact-step-subtitle">
                {currentStepData.subtext}
              </p>
            </div>

            {/* Animated dots */}
            <div className="loading-compact-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="loading-compact-progress-section">
          {/* Progress bar */}
          <div className="loading-compact-progress-bar">
            <div 
              className="loading-compact-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="loading-compact-indicators">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`loading-compact-indicator ${
                  index === currentStep ? 'loading-compact-indicator-active' : 
                  index < currentStep ? 'loading-compact-indicator-completed' : ''
                }`}
              />
            ))}
          </div>
          
          {/* Step counter */}
          <div className="loading-compact-counter">
            <span>{currentStep + 1}</span>
            <span>/</span>
            <span>{steps.length}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="loading-compact-footer">
          <div className="loading-compact-status">
            <span className="loading-compact-status-icon">⚡</span>
            <span>Processing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
