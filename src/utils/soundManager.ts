// Simple Web Audio API synthesizer for game sounds
// Designed for a "Sketchy/Hand-drawn" RPG aesthetic (Tactile, Punchy, Cartoonish)

class SoundManager {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Context created on user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.context) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.context = new AudioContextClass();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
      } catch (e) {
        console.error('Failed to create AudioContext', e);
        return null;
      }
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.context?.currentTime || 0);
    }
  }

  public getMute(): boolean {
    return this.isMuted;
  }

  // --- Sound Generators ---

  // Move: A soft, paper-like "Tap"
  // Fits the board game / hand-drawn aesthetic
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    
    // Low frequency tap (like a soft drum or finger on paper)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.start(t);
    osc.stop(t + 0.08);

    // Subtle noise for texture (paper friction)
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.linearRampToValueAtTime(0, t + 0.05);

    noise.start(t);
  }

  // Attack: A sharp "Smack" or "Paper Snap"
  public playAttack() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // 1. Impact "Thud" (Low Sine)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    
    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.start(t);
    osc.stop(t + 0.2);

    // 2. Snap "Crack" (Filtered Noise)
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.start(t);
  }

  // Crit: A heavy, distorted "Crunch"
  public playCrit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // Sawtooth for aggressive texture
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4); // Longer drop

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);

    // Add some noise for crunch
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.3);

    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.start(t);
  }

  // Block: A clear, resonant "Ping" or "Bell"
  public playBlock() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // FM Synthesis for metallic sound
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const masterGain = ctx.createGain();

    modulator.frequency.value = 800; // Ratio relative to carrier
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.type = 'sine';
    carrier.frequency.value = 1200; // Base ping pitch
    carrier.connect(masterGain);
    masterGain.connect(this.masterGain);

    modGain.gain.setValueAtTime(1000, t);
    modGain.gain.exponentialRampToValueAtTime(10, t + 0.2);

    masterGain.gain.setValueAtTime(0.4, t);
    masterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5); // Long ring

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 0.5);
    modulator.stop(t + 0.5);
  }

  // Power Up: A magical "Shimmer"
  public playPowerUp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    
    // Quick arpeggio
    const notes = [440, 554, 659, 880]; // A Major
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = t + i * 0.05;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
  }

  // Victory: Short RPG Fanfare
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    // C G E C (High)
    const notes = [
        { f: 523.25, d: 0.1, t: 0 },    // C5
        { f: 523.25, d: 0.1, t: 0.1 },  // C5
        { f: 523.25, d: 0.1, t: 0.2 },  // C5
        { f: 659.25, d: 0.4, t: 0.3 },  // E5
        { f: 783.99, d: 0.4, t: 0.5 },  // G5
        { f: 1046.50, d: 0.6, t: 0.7 }  // C6
    ];

    notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.type = 'triangle'; // Brighter sound
        osc.frequency.value = note.f;

        const start = t + note.t;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + note.d);

        osc.start(start);
        osc.stop(start + note.d);
    });
  }

  // Defeat: "Wah wah wah"
  public playDefeat() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const notes = [
        { f: 392.00, t: 0 },   // G
        { f: 369.99, t: 0.3 }, // F#
        { f: 349.23, t: 0.6 }, // F
        { f: 311.13, t: 0.9 }  // Eb (Sustain)
    ];

    notes.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, t + note.t);
        // Pitch bend down for sad effect
        osc.frequency.linearRampToValueAtTime(note.f - 10, t + note.t + 0.3);

        const start = t + note.t;
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + (i === 3 ? 1.0 : 0.4));

        osc.start(start);
        osc.stop(start + (i === 3 ? 1.0 : 0.4));
    });
  }

  // UI Click: Very subtle tick
  public playClick() {
     if (this.isMuted) return;
     const ctx = this.getContext();
     if (!ctx || !this.masterGain) return;
 
     const t = ctx.currentTime;
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
 
     osc.connect(gain);
     gain.connect(this.masterGain);
 
     osc.type = 'sine';
     osc.frequency.setValueAtTime(800, t);
     osc.frequency.exponentialRampToValueAtTime(1200, t + 0.03);
 
     gain.gain.setValueAtTime(0.05, t); // Very Quiet
     gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
 
     osc.start(t);
     osc.stop(t + 0.03);
  }
}

export const soundManager = new SoundManager();
