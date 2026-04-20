import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable()
export class TimerService implements OnDestroy {
  private intervalId: number = null;

  public readonly leftTime = signal<number>(0);
  private readonly initialTime = signal<number>(0);
  public readonly running = signal<boolean>(false);

  start(seconds: number = 60): void {
    this.stop();

    this.initialTime.set(seconds);
    this.leftTime.set(seconds);
    this.running.set(true);

    this.intervalId = setInterval(() => {
      const current = this.leftTime();

      if (current <= 1) {
        this.stop();
        this.leftTime.set(0);
        return;
      }

      this.leftTime.set(current - 1);
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.running.set(false);
  }

  continue(): void {
    if (this.running()) return;
    if (this.leftTime() <= 0) return;

    this.running.set(true);

    this.intervalId = setInterval(() => {
      const current = this.leftTime();

      if (current <= 1) {
        this.stop();
        this.leftTime.set(0);
        return;
      }

      this.leftTime.set(current - 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
