import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number; // Default typing speed (ms per character)
  onComplete?: () => void;
  active?: boolean;
}

export function Typewriter({ text, speed = 8, onComplete, active = true }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!active) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;
    let isCancelled = false;

    // We use a recursive timeout function for fine-grained delay control 
    // (such as inserting thinking punctuation/phrase pauses).
    function typeNextChar() {
      if (isCancelled) return;

      if (currentIndex >= text.length) {
        if (onComplete) onComplete();
        return;
      }

      const currentChar = text[currentIndex];
      setDisplayedText((prev) => prev + currentChar);
      currentIndex++;

      let delay = speed;

      // Detect end of phrases (period, exclamation, question mark followed by a space)
      // to insert an analytical, organic pause as if thinking.
      if (
        (currentChar === '.' || currentChar === '!' || currentChar === '?') &&
        (currentIndex < text.length && text[currentIndex] === ' ')
      ) {
        delay = 280; // Small delay after sentence ends
      } else if (currentChar === ',' && (currentIndex < text.length && text[currentIndex] === ' ')) {
        delay = 120; // Even slighter delay on commas
      }

      setTimeout(typeNextChar, delay);
    }

    const startTimeout = setTimeout(typeNextChar, speed);

    return () => {
      isCancelled = true;
      clearTimeout(startTimeout);
    };
  }, [text, speed, active]);

  return <span>{displayedText}</span>;
}


interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
  active?: boolean;
}

export function CountUp({ value, duration = 800, prefix = '', suffix = '', onComplete, active = true }: CountUpProps) {
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentVal(0);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) {
      if (onComplete) onComplete();
      return;
    }

    const totalMiliseconds = duration;
    const incrementTime = 16; // running at ~60fps
    const totalSteps = totalMiliseconds / incrementTime;
    const stepIncrement = (end - start) / totalSteps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setCurrentVal(end);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setCurrentVal((prev) => prev + stepIncrement);
      }
    }, incrementTime);

    return () => clearInterval(interval);
  }, [value, duration, active]);

  return <span>{prefix}{currentVal.toFixed(2)}{suffix}</span>;
}
