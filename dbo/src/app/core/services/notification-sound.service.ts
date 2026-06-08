import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class NotificationSoundService {
  private sound = new Howl({
    src: ['assets/sounds/notify.mp3'],
    volume: 0.8
  });

  play() {
    this.sound.play();
  }
}
