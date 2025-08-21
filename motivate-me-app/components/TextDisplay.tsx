'use client';

import { useEffect, useState } from 'react';
import { convertToWordTimestamps, getCurrentWordIndex } from '@/lib/elevenlabs';
import type { GeneratedSpeech } from '@/types';

interface TextDisplayProps {
  speech: GeneratedSpeech;
  currentTime: number;
  isPlaying: boolean;
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  characters: number[];
}

interface LineInfo {
  words: WordTimestamp[];
  startTime: number;
  endTime: number;
  text: string;
}

export function TextDisplay({ 
  speech, 
  currentTime, 
  isPlaying
}: TextDisplayProps) {
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [lines, setLines] = useState<LineInfo[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  // Process timestamps when speech changes
  useEffect(() => {
    if (speech.timestamps) {
      const words = convertToWordTimestamps(speech.displayText, speech.timestamps);
      setWordTimestamps(words);
      
      // Split words into lines (approximate by sentence endings or length)
      const linesData: LineInfo[] = [];
      let currentLine: WordTimestamp[] = [];
      let lineStartTime = 0;
      
      words.forEach((word, index) => {
        if (currentLine.length === 0) {
          lineStartTime = word.start;
        }
        
        currentLine.push(word);
        
        // End line on sentence endings or after reasonable length
        const shouldEndLine = 
          word.word.includes('.') || 
          word.word.includes('!') || 
          word.word.includes('?') ||
          currentLine.length >= 12; // Max words per line
          
        if (shouldEndLine || index === words.length - 1) {
          const lineText = currentLine.map(w => w.word).join(' ');
          const lineEndTime = word.end;
          
          linesData.push({
            words: [...currentLine],
            startTime: lineStartTime,
            endTime: lineEndTime,
            text: lineText
          });
          
          currentLine = [];
        }
      });
      
      setLines(linesData);
    }
  }, [speech]);

  // Update current word and line based on audio time (even when paused)
  useEffect(() => {
    if (wordTimestamps.length === 0) {
      setCurrentWordIndex(-1);
      setCurrentLineIndex(-1);
      return;
    }

    const wordIndex = getCurrentWordIndex(currentTime, wordTimestamps);
    setCurrentWordIndex(wordIndex);

    if (lines.length > 0) {
      // Pick the last line whose startTime is <= currentTime
      let lineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].startTime) lineIndex = i;
      }
      setCurrentLineIndex(lineIndex);
    }
  }, [currentTime, wordTimestamps, lines]);



  const renderText = () => {
    // If we don't have timestamps, fall back to first sentence only
    if (wordTimestamps.length === 0 || lines.length === 0) {
      const firstSentence = speech.displayText.split(/(?<=[.!?])\s+/)[0] || speech.displayText;
      return <p className="text-xl leading-relaxed text-center font-semibold tracking-wide">{firstSentence}</p>;
    }

    // Determine which single sentence to show (follow time even when paused)
    const activeIndex = currentLineIndex === -1 ? 0 : Math.max(0, currentLineIndex);
    const currentLine = lines[activeIndex];
    if (!currentLine) {
      const fallbackSentence = speech.displayText.split(/(?<=[.!?])\s+/)[0] || speech.displayText;
      return <p className="text-xl leading-relaxed text-center font-semibold tracking-wide">{fallbackSentence}</p>;
    }

    return (
      <p className="text-xl leading-relaxed text-center font-semibold tracking-wide">
        {currentLine.words.map((word, index) => {
          const globalWordIndex = wordTimestamps.findIndex(w => 
            w.word === word.word && w.start === word.start
          );
          const isCurrent = isPlaying && globalWordIndex === currentWordIndex;
          
          return (
            <span
              key={index}
              className={`transition-all duration-300 ease-out ${
                isCurrent 
                  ? 'word-highlight-active transform scale-105' 
                  : 'word-highlight-inactive'
              }`}
            >
              {word.word}{' '}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="text-display-box-container">
      <div className={`text-display-box ${isPlaying ? 'video-box-playing' : 'video-box-paused'}`}>
        <div 
          key={currentLineIndex} 
          className="text-line-container animate-fade-in"
        >
          {renderText()}
        </div>
      </div>
    </div>
  );
}
