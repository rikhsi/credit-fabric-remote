import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
  Output,
  EventEmitter
} from '@angular/core';
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-idle-timer-circle',
  templateUrl: './idle-timer-circle.component.html',
  styleUrls: ['./idle-timer-circle.component.css']
})
export class IdleTimerCircleComponent implements OnInit, OnDestroy {
  @Input() totalSeconds = 10;
  @Input() remainingTime?: number;
  @Output() close = new EventEmitter<void>();

  remainingSeconds!: number;
  protected readonly userService = inject(UserService);
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.remainingSeconds = this.remainingTime ?? this.totalSeconds;
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startTimer() {
    const startTime = Date.now();
    const duration = this.remainingSeconds * 1000;

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(duration - elapsed, 0);
      this.remainingSeconds = +(remaining / 1000).toFixed(1);
      this.cdr.detectChanges();

      if (remaining <= 0) {
        clearInterval(this.intervalId);
        this.userService.logout();
        this.close.emit();
      }
    }, 100);
  }

  get progress() {
    const percent = this.remainingSeconds / this.totalSeconds;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    return circumference * (1 - percent);
  }

  get formattedTime() {
    const totalSeconds = Math.floor(this.remainingSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
