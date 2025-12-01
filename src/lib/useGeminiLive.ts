/**
 * React Hook for Gemini Live API
 * Provides easy-to-use interface for voice chat with Sarah
 * 
 * IMPORTANT: This hook uses refs for critical state to avoid React StrictMode
 * double-mounting issues and stale closure problems.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { GeminiLiveSession, type GeminiLiveCallbacks } from "./gemini.session";
import { AudioCapture, AudioPlayback } from "./audio";

export interface UseGeminiLiveOptions {
  apiKey: string;
  onTranscript?: (text: string, role: "user" | "assistant") => void;
  onFunctionCall?: (name: string, args: Record<string, unknown>, id: string) => void;
}

export interface UseGeminiLiveReturn {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendText: (text: string) => void;
  sendFunctionResponse: (id: string, name: string, response: unknown) => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions): UseGeminiLiveReturn {
  const { apiKey, onTranscript, onFunctionCall } = options;
  
  // UI state - can be synced asynchronously
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Critical refs - used for synchronous state checks to avoid race conditions
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const audioPlaybackRef = useRef<AudioPlayback | null>(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Store callbacks in ref to avoid recreating session on every render
  const callbacksRef = useRef({ onTranscript, onFunctionCall });
  useEffect(() => {
    callbacksRef.current = { onTranscript, onFunctionCall };
  }, [onTranscript, onFunctionCall]);
  
  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup on unmount - but DON'T call disconnect here to avoid race conditions
      // Instead, manually cleanup refs
      audioCaptureRef.current?.stop();
      audioCaptureRef.current = null;
      audioPlaybackRef.current?.close();
      audioPlaybackRef.current = null;
      if (sessionRef.current) {
        sessionRef.current.disconnect();
        sessionRef.current = null;
      }
    };
  }, []);
  
  const connect = useCallback(async () => {
    // Guard: already connected or connecting
    if (sessionRef.current?.connected) {
      console.log("[useGeminiLive] Already connected, skipping");
      return;
    }
    
    if (isConnectingRef.current) {
      console.log("[useGeminiLive] Already connecting, skipping");
      return;
    }
    
    isConnectingRef.current = true;
    setError(null);
    
    console.log("[useGeminiLive] Starting connection...");
    
    const callbacks: GeminiLiveCallbacks = {
      onConnected: () => {
        console.log("[useGeminiLive] onConnected callback fired");
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setIsConnected(true);
        }
      },
      onDisconnected: () => {
        console.log("[useGeminiLive] onDisconnected callback fired");
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setIsConnected(false);
          setIsListening(false);
          setIsSpeaking(false);
        }
      },
      onAudioResponse: (audioData) => {
        if (!isMountedRef.current) return;
        setIsSpeaking(true);
        
        if (!audioPlaybackRef.current) {
          audioPlaybackRef.current = new AudioPlayback();
        }
        audioPlaybackRef.current.enqueue(audioData);
        
        // Reset speaking state after audio duration
        const durationMs = (audioData.length / 24000) * 1000;
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsSpeaking(false);
          }
        }, durationMs);
      },
      onTextResponse: (text) => {
        if (!isMountedRef.current) return;
        callbacksRef.current.onTranscript?.(text, "assistant");
      },
      onFunctionCall: (name, args, id) => {
        console.log("[useGeminiLive] Function call:", name, args, "id:", id);
        if (!isMountedRef.current) return;
        callbacksRef.current.onFunctionCall?.(name, args, id);
      },
      onError: (err) => {
        console.error("[useGeminiLive] Error:", err);
        isConnectingRef.current = false;
        if (isMountedRef.current) {
          setError(err.message);
        }
      },
      onInterrupted: () => {
        console.log("[useGeminiLive] Interrupted");
        if (!isMountedRef.current) return;
        audioPlaybackRef.current?.clear();
        setIsSpeaking(false);
      },
    };
    
    try {
      const session = new GeminiLiveSession({ apiKey }, callbacks);
      sessionRef.current = session;
      await session.connect();
      console.log("[useGeminiLive] Connection established");
    } catch (err) {
      isConnectingRef.current = false;
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      throw err;
    }
  }, [apiKey]); // Only depend on apiKey - callbacks stored in ref
  
  const disconnect = useCallback(() => {
    console.log("[useGeminiLive] Disconnect called");
    
    // Stop audio capture
    if (audioCaptureRef.current) {
      audioCaptureRef.current.stop();
      audioCaptureRef.current = null;
    }
    
    // Stop audio playback
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.close();
      audioPlaybackRef.current = null;
    }
    
    // Disconnect session
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    
    isConnectingRef.current = false;
    
    if (isMountedRef.current) {
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, []); // No dependencies - uses only refs
  
  const startListening = useCallback(async () => {
    if (!sessionRef.current?.connected) {
      setError("Not connected to Gemini");
      return;
    }
    
    if (audioCaptureRef.current) {
      console.log("[useGeminiLive] Already listening");
      return;
    }
    
    try {
      const capture = new AudioCapture();
      audioCaptureRef.current = capture;
      
      await capture.start((audioData) => {
        sessionRef.current?.sendAudio(audioData);
      });
      
      if (isMountedRef.current) {
        setIsListening(true);
        setError(null);
      }
    } catch (err) {
      audioCaptureRef.current = null;
      const errorMessage = err instanceof Error ? err.message : "Failed to start microphone";
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      throw err;
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (audioCaptureRef.current) {
      audioCaptureRef.current.stop();
      audioCaptureRef.current = null;
    }
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);
  
  const sendText = useCallback((text: string) => {
    if (!sessionRef.current?.connected) {
      setError("Not connected to Gemini");
      return;
    }
    
    callbacksRef.current.onTranscript?.(text, "user");
    sessionRef.current.sendText(text);
  }, []);
  
  const sendFunctionResponse = useCallback((id: string, name: string, response: unknown) => {
    if (!sessionRef.current?.connected) {
      setError("Not connected to Gemini");
      return;
    }
    
    sessionRef.current.sendFunctionResponse(id, name, response);
  }, []);
  
  return {
    isConnected,
    isListening,
    isSpeaking,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendText,
    sendFunctionResponse,
  };
}
