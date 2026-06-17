/**
 * Minimalist Programmatic Audio Synthesizer using Web Audio API.
 * Synthesizes premium, professional, and Apple-inspired sound effects
 * dynamically in the browser, eliminating the need for large audio asset files.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }
}

  /**
   * Play a clean, subtle Apple-style click sound (short high-frequency transient)
   */
  public playClick() {
    this.init();
    if (!this.ctx) return;
    
    // Resume audio context if suspended (browser security policies)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Play a premium ascending success arpeggio (C-major major 7th feel)
   */
  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77]; // C5, E5, G5, B5

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.07;
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.04, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      // Add a light lowpass filter to make it softer and warmer
      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, startTime);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  /**
   * Play a clean, professional error/warning sound (low dual-frequency chime)
   */
  public playError() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Play two dissonant but soft frequencies
    [180, 178].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.35);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  /**
   * Play a notification chime (dual pleasant high frequency tones)
   */
  public playNotification() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // First tone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.03, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone, slightly delayed and higher pitch
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.1); // E6
    gain2.gain.setValueAtTime(0.03, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  }
}

export const audioSystem = new AudioSynthesizer();
