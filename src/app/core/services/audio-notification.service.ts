import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioNotificationService {
  private audio = new Audio();
  // Using a short, professional "pop" or "ding" sound
  private readonly SOUND_URL = 'https://actions.google.com/sounds/v1/ui/message_notification.ogg';
  private userInteracted = false;

  constructor() {
    this.audio.src = this.SOUND_URL;
    this.audio.load();

    // Browsers block autoplay until the user interacts with the document
    const unlockAudio = () => {
      this.userInteracted = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  play() {
    if (!this.userInteracted) {
      console.warn('Audio playback blocked: user has not interacted with the page yet.');
      return;
    }
    
    // Clone node to allow rapid successive plays
    const sound = this.audio.cloneNode() as HTMLAudioElement;
    sound.volume = 0.6; // Slightly softer volume
    sound.play().catch(e => console.error('Audio play failed:', e));
  }
}
