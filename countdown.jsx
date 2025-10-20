import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// --- from components/sound.ts ---
const playFlipSound = (audioContext, delay = 0) => {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const startTime = audioContext.currentTime + delay;
  const attackTime = 0.003;
  const decayTime = 0.1; // Reduced for a snappier sound
  const whirrDuration = 0.05; // Reduced for a snappier sound
  const mainImpactOffset = 0.02;

  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-30, startTime);
  compressor.knee.setValueAtTime(30, startTime);
  compressor.ratio.setValueAtTime(12, startTime);
  compressor.attack.setValueAtTime(0.003, startTime);
  compressor.release.setValueAtTime(0.15, startTime); // Reduced for a tighter sound
  compressor.connect(audioContext.destination);

  const whirrOsc = audioContext.createOscillator();
  const whirrGain = audioContext.createGain();
  whirrOsc.type = 'sawtooth';
  whirrOsc.frequency.setValueAtTime(80, startTime);
  whirrOsc.frequency.linearRampToValueAtTime(120, startTime + whirrDuration);

  whirrGain.gain.setValueAtTime(0, startTime);
  whirrGain.gain.linearRampToValueAtTime(0.1, startTime + attackTime);
  whirrGain.gain.exponentialRampToValueAtTime(0.0001, startTime + whirrDuration);

  whirrOsc.connect(whirrGain);
  whirrGain.connect(compressor);

  const bufferSize = audioContext.sampleRate * 0.1;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(900, startTime);
  noiseFilter.Q.setValueAtTime(5, startTime);

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, startTime + mainImpactOffset);
  noiseGain.gain.linearRampToValueAtTime(1.0, startTime + mainImpactOffset + attackTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + mainImpactOffset + decayTime);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(compressor);

  const bodyOsc = audioContext.createOscillator();
  const bodyFilter = audioContext.createBiquadFilter();
  const bodyGain = audioContext.createGain();

  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(120, startTime);

  bodyFilter.type = 'lowpass';
  bodyFilter.frequency.setValueAtTime(300, startTime);

  bodyGain.gain.setValueAtTime(0, startTime + mainImpactOffset);
  bodyGain.gain.linearRampToValueAtTime(0.7, startTime + mainImpactOffset + attackTime);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + mainImpactOffset + decayTime);

  bodyOsc.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(compressor);

  whirrOsc.start(startTime);
  whirrOsc.stop(startTime + whirrDuration);

  noiseSource.start(startTime + mainImpactOffset);
  noiseSource.stop(startTime + mainImpactOffset + decayTime);

  bodyOsc.start(startTime + mainImpactOffset);
  bodyOsc.stop(startTime + mainImpactOffset + decayTime);
};

// --- from components/Icons.tsx ---
const SoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.707.707L5.586 15z" />
  </svg>
);
const MutedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-cyan-400 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9l-6 6M12 9l6 6" />
  </svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-cyan-400 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
);

// --- from components/FlipUnit.tsx ---
const DigitCard = ({ digit, position }) => {
  const isTop = position === 'top';
  const baseClasses = "w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono text-zinc-900 bg-gradient-to-b from-gray-200 via-white to-gray-300 shadow-inner [text-shadow:0_1px_1px_rgba(255,255,255,0.5)]";
  const positionClasses = isTop ? "rounded-t-lg items-end pb-1" : "rounded-b-lg items-start pt-1";
  const innerDivClasses = isTop ? "border-b border-black/20" : "";
  return (
    <div className={`${baseClasses} ${positionClasses}`}>
      <div className={`${innerDivClasses} w-full h-full flex items-center justify-center`}>
        {digit}
      </div>
    </div>
  );
};
const FlipUnit = ({ digit, isMuted, audioContext }) => {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  useEffect(() => {
    if (digit !== currentDigit) {
      if (!isMuted && audioContext) {
        playFlipSound(audioContext, 0.38);
      }
      setPreviousDigit(currentDigit);
      setCurrentDigit(digit);
      setIsFlipping(true);
    }
  }, [digit, currentDigit, isMuted, audioContext]);
  useEffect(() => {
    if (!isFlipping) return;
    const timeoutId = setTimeout(() => {
      setPreviousDigit(digit);
      setIsFlipping(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [isFlipping, digit]);
  return (
    <div className="relative w-8 h-14 sm:w-10 sm:h-16 md:w-12 md:h-20 lg:w-14 lg:h-24 perspective-1000 shadow-lg shadow-black/60 rounded-lg overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(165deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_20%)] z-30 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-full h-1/2">
        <DigitCard digit={previousDigit} position="bottom" />
      </div>
      <div className="absolute top-0 left-0 w-full h-1/2">
        <DigitCard digit={currentDigit} position="top" />
      </div>
      <div className="absolute top-1/2 -mt-px w-full h-px bg-black/50 z-20"></div>
      <div className={`absolute top-0 left-0 w-full h-1/2 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.45,0,0.55,1)] transform-style-preserve-3d ${isFlipping ? '[transform:rotateX(-180deg)]' : ''}`}>
        <div className="absolute inset-0 backface-hidden z-10">
          <DigitCard digit={previousDigit} position="top" />
        </div>
        <div className="absolute inset-0 [transform:rotateX(180deg)] backface-hidden">
          <DigitCard digit={currentDigit} position="bottom" />
        </div>
      </div>
    </div>
  );
};

// --- from components/FlipClock.tsx ---
const Separator = () => (
  <div className="flex flex-col gap-1 md:gap-2">
    <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-zinc-800 ring-1 ring-inset ring-zinc-700"></div>
    <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-zinc-800 ring-1 ring-inset ring-zinc-700"></div>
  </div>
);
const FlipClock = ({ days, hours, minutes, seconds, isMuted, audioContext }) => {
  const daysStr = days.toString().padStart(2, '0');
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2">
      <div className="flex gap-0.5 md:gap-1">
        <FlipUnit digit={daysStr[0]} audioContext={audioContext} isMuted={isMuted} />
        <FlipUnit digit={daysStr[1]} audioContext={audioContext} isMuted={isMuted} />
      </div>
      <Separator />
      <div className="flex gap-0.5 md:gap-1">
        <FlipUnit digit={hoursStr[0]} audioContext={audioContext} isMuted={isMuted} />
        <FlipUnit digit={hoursStr[1]} audioContext={audioContext} isMuted={isMuted} />
      </div>
      <Separator />
      <div className="flex gap-0.5 md:gap-1">
        <FlipUnit digit={minutesStr[0]} audioContext={audioContext} isMuted={isMuted} />
        <FlipUnit digit={minutesStr[1]} audioContext={audioContext} isMuted={isMuted} />
      </div>
      <Separator />
      <div className="flex gap-0.5 md:gap-1">
        <FlipUnit digit={secondsStr[0]} audioContext={audioContext} isMuted={isMuted} />
        <FlipUnit digit={secondsStr[1]} audioContext={audioContext} isMuted={isMuted} />
      </div>
    </div>
  );
};

// --- from components/DateDisplay.tsx ---
const DateDisplay = ({ date }) => {
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const dateString = date.toLocaleDateString('en-US', options);
  return (
    <div className="mt-2 text-center text-gray-600 text-xs md:text-sm">
      {dateString}
    </div>
  );
};

// --- from App.tsx ---
const targetDate = new Date('2025-10-16T15:00:00+02:00');
const App = () => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      setRemaining(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const days = Math.floor(remaining / (1000*60*60*24));
  const hours = Math.floor((remaining % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((remaining % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((remaining % (1000*60)) / 1000);
  const [isMuted, setIsMuted] = useState(true);
  const audioContextRef = useRef(null);
  return (
    <div className="text-center" onClick={() => { const el = document.querySelector('.event-exclusive'); el.scrollIntoView({behavior:'smooth'}); }}>
      <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">Countdown to Webinar</h3>
      <FlipClock days={days} hours={hours} minutes={minutes} seconds={seconds} isMuted={isMuted} audioContext={audioContextRef.current} />
      <DateDisplay date={targetDate} />
    </div>
  );
};

// --- from index.tsx ---
const rootElement = document.getElementById('countdown-root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);