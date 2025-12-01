import React, { useState, useEffect, useRef } from 'react';
import {
  RiMicLine,
  RiMicOffLine,
  RiLoader4Line,
  RiPulseLine,
  RiWifiOffLine,
} from 'react-icons/ri';
import { MdClose, MdCall, MdCallEnd } from 'react-icons/md';
import { useGeminiLive } from '../../lib/useGeminiLive';

// ============================================================
// GEMINI LIVE VOICE MODAL - Using Gemini Live 2.5 Flash API
// ============================================================

interface GeminiVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript?: (userText: string, assistantText: string) => void;
}

// Audio visualization component
const AudioVisualizer: React.FC<{ isActive: boolean; isListening: boolean; isSpeaking: boolean }> = ({ 
  isActive, 
  isListening,
  isSpeaking 
}) => {
  const bars = 7;
  const [heights, setHeights] = useState<number[]>(() => Array(bars).fill(8));
  
  useEffect(() => {
    if (!isActive) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeout = setTimeout(() => setHeights(Array(bars).fill(8)), 0);
      return () => clearTimeout(timeout);
    }
    
    const interval = setInterval(() => {
      setHeights(
        Array(bars)
          .fill(0)
          .map(() => (isActive ? 12 + Math.random() * 48 : 8))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [isActive, bars]);
  
  return (
    <div className="flex items-center justify-center gap-1.5 h-20">
      {heights.map((height, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-100 ${
            isActive 
              ? isListening 
                ? 'bg-green-400' 
                : isSpeaking 
                  ? 'bg-blue-400' 
                  : 'bg-vcb-400'
              : 'bg-vcb-600'
          }`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

// Get Gemini API key from environment
const getApiKey = (): string => {
  // Try Vite env vars first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Fallback - in production this should come from a secure backend
  return '';
};

export const GeminiVoiceModal: React.FC<GeminiVoiceModalProps> = ({ 
  isOpen, 
  onClose,
  onTranscript 
}) => {
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, text: string}>>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [apiKeyMissing] = useState(() => !getApiKey());
  
  // Track previous isOpen to detect close
  const prevIsOpenRef = useRef(isOpen);
  const disconnectRef = useRef<(() => void) | null>(null);
  
  // Gemini Live hook
  const {
    isConnected,
    isListening,
    isSpeaking,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendFunctionResponse,
  } = useGeminiLive({
    apiKey: getApiKey(),
    onTranscript: (text, role) => {
      setCurrentTranscript(prev => role === 'user' ? text : prev);
      setConversationHistory(prev => {
        // Update or add to conversation
        const lastItem = prev[prev.length - 1];
        if (lastItem && lastItem.role === role) {
          // Append to existing message
          return [
            ...prev.slice(0, -1),
            { role, text: lastItem.text + text }
          ];
        }
        // Add new message
        return [...prev, { role, text }];
      });
      
      // Send transcript callback
      if (onTranscript && role === 'assistant') {
        onTranscript(currentTranscript, text);
      }
    },
    onFunctionCall: async (name, args, id) => {
      console.log('[GeminiVoiceModal] Function call:', name, args, 'id:', id);
      
      if (name === 'send_email_transcript') {
        // TODO: User will provide this function later
        console.log('Email transcript requested:', args);
        sendFunctionResponse(id, name, { success: true, message: 'Email queued for sending' });
      } else if (name === 'schedule_callback') {
        console.log('Callback requested:', args);
        sendFunctionResponse(id, name, { success: true, message: 'Callback scheduled' });
      }
    },
  });
  
  // Store disconnect in ref to avoid stale closures
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  // Status derived from states
  const status = isListening 
    ? 'listening' 
    : isSpeaking 
      ? 'speaking' 
      : isConnected 
        ? 'idle' 
        : 'disconnected';

  // Handle modal close - ONLY when transitioning from open to closed
  // Use a ref-based approach to avoid dependency on disconnect function
  useEffect(() => {
    // Detect transition from open to closed
    if (prevIsOpenRef.current && !isOpen) {
      console.log('[GeminiVoiceModal] Modal closing, disconnecting...');
      disconnectRef.current?.();
      // Clean up state after a tick to avoid batched state issues
      setTimeout(() => {
        setConversationHistory([]);
        setCurrentTranscript('');
      }, 0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]); // NO disconnect in deps - use ref instead

  // Connect when modal opens
  const handleConnect = async () => {
    if (apiKeyMissing) {
      console.error('No Gemini API key found. Set VITE_GEMINI_API_KEY environment variable.');
      return;
    }
    
    console.log('[GeminiVoiceModal] handleConnect called');
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleDisconnect = () => {
    console.log('[GeminiVoiceModal] handleDisconnect called');
    disconnect();
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        await startListening();
      } catch (err) {
        console.error('Failed to start listening:', err);
      }
    }
  };

  const handleClose = () => {
    console.log('[GeminiVoiceModal] handleClose called');
    disconnect();
    setConversationHistory([]);
    setCurrentTranscript('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-vcb-800 to-vcb-900 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vcb-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-vcb-600 flex items-center justify-center">
              {isConnected ? (
                <RiPulseLine className={`w-6 h-6 ${status !== 'idle' ? 'text-green-400 animate-pulse' : 'text-vcb-300'}`} />
              ) : (
                <RiWifiOffLine className="w-6 h-6 text-vcb-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Sarah Voice</h3>
              <p className="text-vcb-400 text-sm">
                {isConnected ? 'Gemini Live 2.5 Flash' : 'Not Connected'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-vcb-700 hover:bg-vcb-600 flex items-center justify-center text-vcb-300 hover:text-white transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* API Key Missing Warning */}
          {apiKeyMissing && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-6">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ Gemini API key not configured. Set <code className="bg-yellow-800/50 px-1 rounded">VITE_GEMINI_API_KEY</code> in your environment.
              </p>
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Status Display */}
          <div className="text-center mb-8">
            <p className="text-vcb-300 text-sm uppercase tracking-wider mb-2">
              {status === 'disconnected' && 'Ready to Connect'}
              {status === 'idle' && 'Connected - Ready'}
              {status === 'listening' && 'Listening...'}
              {status === 'speaking' && 'Sarah is Speaking...'}
            </p>
            
            {/* Audio Visualization */}
            <div className="my-6">
              <AudioVisualizer 
                isActive={isConnected && (isListening || isSpeaking)} 
                isListening={isListening} 
                isSpeaking={isSpeaking}
              />
            </div>
            
            {/* Transcript Display */}
            {currentTranscript && isListening && (
              <div className="bg-vcb-700/50 rounded-xl p-4 mb-4 max-h-24 overflow-y-auto">
                <p className="text-vcb-200 text-sm italic">"{currentTranscript}"</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Connect/Disconnect Button */}
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={apiKeyMissing}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isConnected 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : apiKeyMissing
                    ? 'bg-vcb-700 text-vcb-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
              title={isConnected ? 'Disconnect' : 'Connect'}
            >
              {isConnected ? (
                <MdCallEnd className="w-6 h-6" />
              ) : (
                <MdCall className="w-6 h-6" />
              )}
            </button>

            {/* Main Mic Button */}
            <button
              onClick={toggleListening}
              disabled={!isConnected || isSpeaking}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                !isConnected
                  ? 'bg-vcb-700 text-vcb-500 cursor-not-allowed'
                  : isListening
                    ? 'bg-green-500 text-white scale-110 animate-pulse'
                    : isSpeaking
                      ? 'bg-blue-500 text-white cursor-wait'
                      : 'bg-vcb-600 text-white hover:bg-vcb-500 hover:scale-105'
              }`}
            >
              {isSpeaking ? (
                <RiLoader4Line className="w-10 h-10 animate-spin" />
              ) : isListening ? (
                <RiMicLine className="w-10 h-10" />
              ) : (
                <RiMicOffLine className="w-10 h-10" />
              )}
            </button>

            {/* Spacer for balance */}
            <div className="w-14 h-14" />
          </div>
        </div>

        {/* Footer / Instructions */}
        <div className="px-6 pb-6">
          <p className="text-vcb-500 text-xs text-center">
            {!isConnected 
              ? 'Tap the green phone button to start a voice call with Sarah.'
              : 'Tap the microphone to speak. Sarah uses Gemini Live 2.5 Flash for natural conversation.'
            }
          </p>
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="border-t border-vcb-700 px-6 py-4 max-h-48 overflow-y-auto">
            <p className="text-vcb-500 text-xs uppercase tracking-wider mb-3">Conversation</p>
            <div className="space-y-2">
              {conversationHistory.slice(-6).map((msg, i) => (
                <div key={i} className={`text-xs ${msg.role === 'user' ? 'text-green-300' : 'text-blue-300'}`}>
                  <span className="font-semibold">{msg.role === 'user' ? 'You: ' : 'Sarah: '}</span>
                  {msg.text.substring(0, 150)}{msg.text.length > 150 ? '...' : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiVoiceModal;
