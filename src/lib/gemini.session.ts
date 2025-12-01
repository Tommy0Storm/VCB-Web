/**
 * Gemini Live API Session Manager
 * Uses @google/genai SDK for proper Live API WebSocket support
 * 
 * Based on the working colab.txt reference implementation
 */

import { GoogleGenAI, type LiveServerMessage, Modality, type Session, Type, type FunctionDeclaration } from "@google/genai";
import { MODELS, SARAH_SYSTEM_INSTRUCTION, DEFAULT_VOICE, type VoiceId } from "./gemini.config";
import { AudioNormalizer } from "./audio-normalizer";

export interface GeminiLiveCallbacks {
  onAudioResponse?: (audioData: Uint8Array) => void;
  onTextResponse?: (text: string) => void;
  onFunctionCall?: (name: string, args: Record<string, unknown>, id: string) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInterrupted?: () => void;
  onSetupComplete?: () => void;
}

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  voice?: VoiceId;
  systemInstruction?: string;
}

// Tool declarations with proper SDK types
const TOOL_DECLARATIONS_SDK: FunctionDeclaration[] = [
  {
    name: "send_email_transcript",
    description: "Send the conversation transcript to the user's email address",
    parameters: {
      type: Type.OBJECT,
      properties: {
        email: {
          type: Type.STRING,
          description: "The recipient's email address",
        },
        transcript: {
          type: Type.STRING,
          description: "The conversation transcript to send",
        },
      },
      required: ["email", "transcript"],
    },
  },
  {
    name: "schedule_callback",
    description: "Schedule a callback from the VCB team",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The caller's name",
        },
        phone: {
          type: Type.STRING,
          description: "The caller's phone number",
        },
        preferredTime: {
          type: Type.STRING,
          description: "Preferred callback time",
        },
        topic: {
          type: Type.STRING,
          description: "What they want to discuss",
        },
      },
      required: ["name", "phone"],
    },
  },
];

/**
 * Gemini Live Session - uses @google/genai SDK for proper Live API support
 */
export class GeminiLiveSession {
  private session: Session | null = null;
  private client: GoogleGenAI;
  private callbacks: GeminiLiveCallbacks;
  private config: GeminiLiveConfig;
  private normalizer: AudioNormalizer;
  private _isConnected = false;
  
  constructor(config: GeminiLiveConfig, callbacks: GeminiLiveCallbacks = {}) {
    this.config = {
      model: MODELS.nativeAudio,
      voice: DEFAULT_VOICE,
      systemInstruction: SARAH_SYSTEM_INSTRUCTION,
      ...config,
    };
    this.callbacks = callbacks;
    this.normalizer = new AudioNormalizer();
    
    // Initialize the Google GenAI client
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }
  
  /**
   * Connect to Gemini Live API using the SDK
   */
  async connect(): Promise<void> {
    if (this._isConnected || this.session) {
      console.log("[GeminiLive] Already connected, skipping");
      return;
    }
    
    console.log("[GeminiLive] Connecting with model:", this.config.model);
    
    try {
      // Build the live config following the colab.txt pattern
      const liveConfig = {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voice,
            },
          },
        },
        systemInstruction: {
          parts: [{ text: this.config.systemInstruction || "" }],
        },
        tools: [
          {
            functionDeclarations: TOOL_DECLARATIONS_SDK,
          },
        ],
      };
      
      console.log("[GeminiLive] Live config prepared");
      
      // Connect using the SDK's live.connect method
      this.session = await this.client.live.connect({
        model: this.config.model!,
        config: liveConfig,
        callbacks: {
          onopen: () => {
            console.log("[GeminiLive] Session opened");
            this._isConnected = true;
            this.callbacks.onConnected?.();
          },
          
          onclose: (event: CloseEvent) => {
            console.log("[GeminiLive] Session closed:", event.code, event.reason);
            this._isConnected = false;
            this.session = null;
            this.callbacks.onDisconnected?.();
          },
          
          onerror: (error: Event | ErrorEvent) => {
            console.error("[GeminiLive] Session error:", error);
            const errorMessage = (error as ErrorEvent).message || "Connection error";
            this.callbacks.onError?.(new Error(errorMessage));
          },
          
          onmessage: async (message: LiveServerMessage) => {
            await this.handleMessage(message);
          },
        },
      });
      
      console.log("[GeminiLive] Session created successfully");
      
    } catch (error) {
      console.error("[GeminiLive] Connection failed:", error);
      this._isConnected = false;
      this.session = null;
      throw error;
    }
  }
  
  /**
   * Handle incoming messages from Gemini Live API
   */
  private async handleMessage(message: LiveServerMessage): Promise<void> {
    // Setup complete
    if (message.setupComplete) {
      console.log("[GeminiLive] Setup complete");
      this.callbacks.onSetupComplete?.();
      return;
    }
    
    // Server content (audio/text responses)
    if (message.serverContent) {
      const serverContent = message.serverContent;
      
      // Handle model turn
      if (serverContent.modelTurn) {
        const parts = serverContent.modelTurn.parts;
        
        if (parts) {
          for (const part of parts) {
            // Audio response - native audio comes as inlineData
            if (part.inlineData) {
              const inlineData = part.inlineData;
              if (inlineData.mimeType?.includes("audio") && inlineData.data) {
                // The data is a base64 string from the SDK
                const audioData = this.base64ToUint8Array(inlineData.data as string);
                this.callbacks.onAudioResponse?.(audioData);
              }
            }
            
            // Text response
            if (part.text) {
              this.callbacks.onTextResponse?.(part.text);
            }
          }
        }
      }
      
      // Handle interruption
      if (serverContent.interrupted) {
        console.log("[GeminiLive] Response interrupted");
        this.callbacks.onInterrupted?.();
      }
      
      // Handle turn complete
      if (serverContent.turnComplete) {
        console.log("[GeminiLive] Turn complete");
      }
    }
    
    // Tool call
    if (message.toolCall) {
      const toolCall = message.toolCall;
      if (toolCall.functionCalls) {
        for (const fc of toolCall.functionCalls) {
          console.log("[GeminiLive] Function call:", fc.name, fc.args);
          this.callbacks.onFunctionCall?.(fc.name!, fc.args as Record<string, unknown>, fc.id!);
        }
      }
    }
  }
  
  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  /**
   * Send audio data to Gemini Live API using SDK's sendRealtimeInput
   */
  sendAudio(audioData: Float32Array): void {
    if (!this.session || !this._isConnected) {
      // Silent fail - don't spam console when disconnected
      return;
    }
    
    try {
      // Convert Float32 to PCM16 base64
      const pcm16Base64 = this.float32ToPcm16Base64(audioData);
      
      // Use the SDK's sendRealtimeInput method with proper format
      this.session.sendRealtimeInput({
        media: {
          mimeType: "audio/pcm;rate=16000",
          data: pcm16Base64,
        },
      });
    } catch (error) {
      // Silently ignore send errors when connection is closing
      if (this._isConnected) {
        console.warn("[GeminiLive] Error sending audio:", error);
      }
    }
  }
  
  /**
   * Send video frame to Gemini Live API
   */
  sendVideoFrame(imageData: Blob | string): void {
    if (!this.session || !this._isConnected) {
      return;
    }
    
    try {
      if (imageData instanceof Blob) {
        // Convert Blob to base64 and send
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          this.session?.sendRealtimeInput({
            media: { mimeType: "image/jpeg", data: base64 },
          });
        };
        reader.readAsDataURL(imageData);
      } else {
        // Already a base64 string
        this.session.sendRealtimeInput({
          media: { mimeType: "image/jpeg", data: imageData },
        });
      }
    } catch (error) {
      if (this._isConnected) {
        console.warn("[GeminiLive] Error sending video frame:", error);
      }
    }
  }
  
  /**
   * Convert Float32 audio to PCM16 base64 string
   */
  private float32ToPcm16Base64(float32: Float32Array): string {
    const buffer = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32.length; i++) {
      let sample = float32[i];
      // Clamp to [-1, 1]
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      view.setInt16(i * 2, sample * 0x7FFF, true);
    }
    
    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Send text message to Gemini Live API
   */
  sendText(text: string): void {
    if (!this.session || !this._isConnected) {
      console.warn("[GeminiLive] Cannot send text - not connected");
      return;
    }
    
    try {
      this.session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });
    } catch (error) {
      console.error("[GeminiLive] Error sending text:", error);
    }
  }
  
  /**
   * Send interruption to stop model speaking
   */
  sendInterruption(): void {
    if (!this.session || !this._isConnected) {
      return;
    }
    
    try {
      // Use client content with empty turn to signal interruption
      this.session.sendClientContent({
        turnComplete: true,
      });
    } catch (error) {
      console.warn("[GeminiLive] Error sending interruption:", error);
    }
  }
  
  /**
   * Send function call response back to Gemini
   */
  sendFunctionResponse(id: string, name: string, response: unknown): void {
    if (!this.session || !this._isConnected) {
      console.warn("[GeminiLive] Cannot send function response - not connected");
      return;
    }
    
    try {
      this.session.sendToolResponse({
        functionResponses: [
          {
            id,
            name,
            response: response as Record<string, unknown>,
          },
        ],
      });
    } catch (error) {
      console.error("[GeminiLive] Error sending function response:", error);
    }
  }
  
  /**
   * Disconnect from Gemini Live API
   */
  disconnect(): void {
    console.log("[GeminiLive] Disconnect called");
    
    if (this.session) {
      try {
        this.session.close();
      } catch (error) {
        console.warn("[GeminiLive] Error closing session:", error);
      }
      this.session = null;
    }
    
    this._isConnected = false;
    this.normalizer.reset();
  }
  
  /**
   * Check if session is connected
   */
  get connected(): boolean {
    return this._isConnected;
  }
}
