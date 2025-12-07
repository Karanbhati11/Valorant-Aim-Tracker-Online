/**
 * Audio System
 * Handles all sound effects using Web Audio API
 */

const AudioSys = {
  ctx: new (window.AudioContext || window.webkitAudioContext)(),
  vol: 0.3,

  /**
   * Initialize audio context (needed for user interaction)
   */
  init() {
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  /**
   * Play sound effects
   */
  play(type) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === "hit") {
      // High pitch ping
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(this.vol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === "miss") {
      // Low thud
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
      gain.gain.setValueAtTime(this.vol * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === "tick") {
      // Metronome tick
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(this.vol * 0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
      osc.start(t);
      osc.stop(t + 0.03);
    }
  },

  /**
   * Set volume (0-1 range, or 0-100 percentage)
   */
  setVolume(value) {
    if (value > 1) {
      this.vol = value / 100;
    } else {
      this.vol = value;
    }
  }
};
