import { RingtoneOption } from '../types';

/**
 * High-fidelity Web Audio API synthesizer for prayer reminder alarms.
 * Self-contained, works completely offline, zero external audio asset dependencies.
 */
class AlarmAudioService {
  private audioCtx: AudioContext | null = null;
  private loopTimer: NodeJS.Timeout | null = null;
  private activeGainNodes: GainNode[] = [];
  private isRinging: boolean = false;
  private currentRingtone: RingtoneOption = 'classic-alarm';
  private currentVolume: number = 0.8;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // Will resume on next user gesture
      });
    }

    return this.audioCtx;
  }

  /**
   * Unlock AudioContext on first user interaction to satisfy browser autoplay policies.
   */
  public unlockAudioContext(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Play a single cycle of the chosen ringtone sound.
   */
  private playCycle(ringtone: RingtoneOption, volume: number): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    const clampedVolume = Math.max(0.01, Math.min(1.0, volume));
    masterGain.gain.setValueAtTime(clampedVolume * 0.45, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.activeGainNodes.push(masterGain);

    const now = ctx.currentTime;

    switch (ringtone) {
      case 'classic-alarm': {
        // Classic dual-beep pattern: Beep 1 (880Hz) + Beep 2 (1046Hz)
        const playBeep = (freq: number, startOffset: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + startOffset);

          // Soft lowpass filter to remove harsh square wave buzz
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2200, now + startOffset);

          gain.gain.setValueAtTime(0.001, now + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.35, now + startOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now + startOffset);
          osc.stop(now + startOffset + duration);
        };

        // Beep pair 1
        playBeep(880, 0, 0.12);
        playBeep(1046.5, 0.16, 0.14);

        // Beep pair 2
        playBeep(880, 0.45, 0.12);
        playBeep(1046.5, 0.61, 0.14);
        break;
      }

      case 'gentle-bell': {
        // Resonant acoustic prayer bell with harmonic overtone
        const freqs = [523.25, 1046.5, 1569.7]; // C5, C6, G6
        const weights = [0.4, 0.2, 0.08];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(weights[idx], now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 2.1);
        });
        break;
      }

      case 'marimba-melody': {
        // 4 warm rising melodic notes: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + (i * 0.22);
          const duration = 0.45;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0.001, noteStart);
          gain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(noteStart);
          osc.stop(noteStart + duration + 0.05);
        });
        break;
      }

      case 'digital-pulse': {
        // Soft modern radar chime
        const tones = [659.25, 880];
        tones.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + (idx * 0.18);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.001, start);
          gain.gain.linearRampToValueAtTime(0.35, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(start);
          osc.stop(start + 0.4);
        });
        break;
      }

      case 'soft-chime': {
        // Deep mindfulness bowl / singing chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // A4
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(443.5, now); // slight beat frequency for warmth

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.3);
        osc2.stop(now + 2.3);
        break;
      }
    }

    // Clean up masterGain after cycle completes
    setTimeout(() => {
      const idx = this.activeGainNodes.indexOf(masterGain);
      if (idx !== -1) {
        this.activeGainNodes.splice(idx, 1);
      }
    }, 2500);
  }

  /**
   * Get the repeat interval for the given ringtone (in ms).
   */
  private getCycleInterval(ringtone: RingtoneOption): number {
    switch (ringtone) {
      case 'classic-alarm':
        return 1300; // Repeat alarm beeps every 1.3 seconds
      case 'gentle-bell':
        return 2600; // Strike bell every 2.6 seconds
      case 'marimba-melody':
        return 2800; // Play motif every 2.8 seconds
      case 'digital-pulse':
        return 1600; // Pulse every 1.6 seconds
      case 'soft-chime':
        return 2800; // Chime every 2.8 seconds
      default:
        return 1500;
    }
  }

  /**
   * Start ringing the alarm continuously in a loop until stopAlarm() is called.
   */
  public startAlarm(options?: { ringtone?: RingtoneOption; volume?: number }): void {
    this.stopAlarm(); // Stop any previous playback

    this.isRinging = true;
    this.currentRingtone = options?.ringtone || 'classic-alarm';
    this.currentVolume = options?.volume ?? 0.8;

    const intervalMs = this.getCycleInterval(this.currentRingtone);

    // Play first cycle immediately
    this.playCycle(this.currentRingtone, this.currentVolume);

    // Repeat until stopped
    this.loopTimer = setInterval(() => {
      if (this.isRinging) {
        this.playCycle(this.currentRingtone, this.currentVolume);
      } else {
        this.stopAlarm();
      }
    }, intervalMs);
  }

  /**
   * Stop the currently ringing alarm immediately.
   */
  public stopAlarm(): void {
    this.isRinging = false;

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    // Smoothly fade out any lingering gain nodes
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.activeGainNodes.forEach(node => {
        try {
          node.gain.cancelScheduledValues(now);
          node.gain.setValueAtTime(node.gain.value, now);
          node.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        } catch {}
      });
      this.activeGainNodes = [];
    }
  }

  /**
   * Preview a ringtone for a brief duration (2-3 cycles) to let user sample the sound.
   */
  public previewRingtone(ringtone: RingtoneOption, volume: number = 0.8): void {
    // If not actively ringing an alarm, play preview
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.playCycle(ringtone, volume);

    const interval = this.getCycleInterval(ringtone);
    setTimeout(() => {
      // play a second cycle for rhythmic feel
      this.playCycle(ringtone, volume);
    }, interval);
  }

  /**
   * Whether the alarm is actively ringing.
   */
  public isAlarmActive(): boolean {
    return this.isRinging;
  }
}

export const alarmAudioService = new AlarmAudioService();
