import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioNotificationService {
  private context: AudioContext | null = null;
  private unlocked = false;
  readonly enabled = signal(localStorage.getItem('smartdesk_notification_sound') !== 'false');

  constructor() {
    const unlock = () => {
      this.unlocked = true;
      this.getContext()?.resume().catch(() => undefined);
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  }

  play(): void {
    if (!this.enabled() || !this.unlocked) return;
    const context = this.getContext();
    if (!context) return;

    context.resume().then(() => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.setValueAtTime(1174.66, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.26);
    }).catch(error => console.error('Audio play failed:', error));
  }

  setEnabled(enabled: boolean): void {
    this.enabled.set(enabled);
    localStorage.setItem('smartdesk_notification_sound', String(enabled));
    if (enabled) this.play();
  }

  private getContext(): AudioContext | null {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
    }
    return this.context;
  }
}
