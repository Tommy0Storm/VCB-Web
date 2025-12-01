/**
 * Audio Normalizer for RMS-based gain control
 * Ensures consistent audio levels for voice output
 */

export class AudioNormalizer {
  private targetRms: number;
  private smoothingFactor: number;
  private currentGain: number;
  
  constructor(targetRms = 0.1, smoothingFactor = 0.1) {
    this.targetRms = targetRms;
    this.smoothingFactor = smoothingFactor;
    this.currentGain = 1.0;
  }
  
  /**
   * Calculate the RMS (Root Mean Square) of audio data
   */
  private calculateRms(audioData: Float32Array): number {
    let sumSquares = 0;
    for (let i = 0; i < audioData.length; i++) {
      sumSquares += audioData[i] * audioData[i];
    }
    return Math.sqrt(sumSquares / audioData.length);
  }
  
  /**
   * Normalize audio data to target RMS level with smooth gain adjustment
   */
  normalize(audioData: Float32Array): Float32Array {
    const rms = this.calculateRms(audioData);
    
    if (rms === 0) {
      return audioData;
    }
    
    // Calculate target gain
    const targetGain = this.targetRms / rms;
    
    // Smooth gain transition to avoid clicks/pops
    this.currentGain = this.currentGain * (1 - this.smoothingFactor) + 
                       targetGain * this.smoothingFactor;
    
    // Limit gain to prevent extreme amplification
    this.currentGain = Math.min(this.currentGain, 10);
    this.currentGain = Math.max(this.currentGain, 0.1);
    
    // Apply gain
    const normalized = new Float32Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      normalized[i] = Math.max(-1, Math.min(1, audioData[i] * this.currentGain));
    }
    
    return normalized;
  }
  
  /**
   * Reset the normalizer state
   */
  reset(): void {
    this.currentGain = 1.0;
  }
}
