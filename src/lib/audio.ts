/**
 * Audio utility functions for Gemini Live API
 * PCM encoding/decoding for 16kHz input and 24kHz output
 */

import { AUDIO_INPUT_SAMPLE_RATE, AUDIO_OUTPUT_SAMPLE_RATE } from "./gemini.config";

/**
 * Create a PCM Blob from Float32Array audio data
 * Converts float samples (-1 to 1) to 16-bit signed integers
 */
export function createPcmBlob(audioData: Float32Array): Blob {
  const buffer = new ArrayBuffer(audioData.length * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < audioData.length; i++) {
    // Clamp to -1 to 1 range
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    // Convert to 16-bit signed integer
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, int16, true); // little-endian
  }
  
  return new Blob([buffer], { type: "audio/pcm" });
}

/**
 * Decode base64 audio data to Float32Array
 * Used for processing audio received from Gemini Live API
 */
export async function decodeAudioData(
  base64Audio: string
): Promise<Float32Array> {
  // Decode base64 to binary
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Convert 16-bit PCM to Float32
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  
  return float32Array;
}

/**
 * Convert Float32Array to base64-encoded PCM
 * Used for sending audio to Gemini Live API
 */
export function float32ToBase64Pcm(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, int16, true);
  }
  
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * Resample audio data to target sample rate
 */
export function resampleAudio(
  audioData: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return audioData;
  }
  
  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const fraction = srcIndex - srcIndexFloor;
    
    // Linear interpolation
    result[i] = audioData[srcIndexFloor] * (1 - fraction) + audioData[srcIndexCeil] * fraction;
  }
  
  return result;
}

/**
 * Audio capture class for microphone input
 */
export class AudioCapture {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onAudioCallback: ((data: Float32Array) => void) | null = null;
  
  async start(onAudio: (data: Float32Array) => void): Promise<void> {
    this.onAudioCallback = onAudio;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      
      this.audioContext = new AudioContext({ sampleRate: AUDIO_INPUT_SAMPLE_RATE });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Use ScriptProcessorNode for compatibility (AudioWorklet would be better for production)
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);
        if (this.onAudioCallback) {
          this.onAudioCallback(audioData);
        }
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error("Failed to start audio capture:", error);
      throw error;
    }
  }
  
  stop(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    
    this.onAudioCallback = null;
  }
}

/**
 * Convert Uint8Array PCM bytes to Float32Array
 * The SDK returns raw PCM bytes (16-bit signed integers, little-endian)
 */
export function pcmBytesToFloat32(pcmBytes: Uint8Array): Float32Array {
  const int16Array = new Int16Array(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength / 2);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  
  return float32Array;
}

/**
 * Audio playback class for playing received audio
 * Supports both Float32Array and Uint8Array (PCM bytes) input
 */
export class AudioPlayback {
  private audioContext: AudioContext | null = null;
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;
  
  constructor() {
    this.audioContext = new AudioContext({ sampleRate: AUDIO_OUTPUT_SAMPLE_RATE });
  }
  
  /**
   * Enqueue audio data for playback
   * @param audioData - Can be Float32Array or Uint8Array (PCM bytes)
   */
  enqueue(audioData: Float32Array | Uint8Array): void {
    // Convert Uint8Array PCM bytes to Float32Array if needed
    const float32Data = audioData instanceof Float32Array 
      ? audioData 
      : pcmBytesToFloat32(audioData);
    
    this.audioQueue.push(float32Data);
    if (!this.isPlaying) {
      this.playNext();
    }
  }
  
  private playNext(): void {
    if (this.audioQueue.length === 0 || !this.audioContext) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const audioData = this.audioQueue.shift()!;
    
    const buffer = this.audioContext.createBuffer(
      1,
      audioData.length,
      AUDIO_OUTPUT_SAMPLE_RATE
    );
    buffer.getChannelData(0).set(audioData);
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextPlayTime);
    
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;
    
    source.onended = () => {
      this.playNext();
    };
  }
  
  clear(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }
  
  close(): void {
    this.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
