import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { RightBarService } from '../../../../right-bar/services/right-bar.service';

@Component({
    selector: 'app-time-panel',
    imports: [
        NgOptimizedImage
    ],
    templateUrl: './time-panel.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimePanelComponent implements OnInit {
  targetHour = 17;
  targetMinute = 0;

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  targetHourFilial = 23;
  targetMinutesFilial = 0;
  filialHours: number = 0;
  filialMinutes: number = 0;
  filialSeconds: number = 0;

  closedFilial = false;
  closed = false;
  destroyRef = inject(DestroyRef);

  operDate!: string;


  private _cdRef = inject(ChangeDetectorRef);
  private countdownSubscription!: Subscription;
  private rightBarService = inject(RightBarService);

  ngOnInit() {
    this.startCountdown();
    this.getOperDay();
  }

  getOperDay() {
    this.rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.operDate = `${val?.currentWorkingDate}`;
      })
  }

  private startCountdown() {
    this.countdownSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      const now = new Date();
      const targetTime = new Date(now);

      const targetFilialTime = new Date(now);
      targetFilialTime.setHours(this.targetHourFilial, this.targetMinutesFilial, 0, 0);

      targetTime.setHours(this.targetHour, this.targetMinute, 0, 0);

      if (now > targetTime) {
        this.closed = true;
      }

      if(now > targetFilialTime) {
        this.closedFilial = true;
      }

      const timeDiffFilial = targetFilialTime.getTime() - now.getTime();
      const timeDiff = targetTime.getTime() - now.getTime();

      this.updateTimeFilial(timeDiffFilial);
      this.updateTime(timeDiff);
    });
  }

  private updateTime(timeDiff: number) {
    const totalSeconds = Math.floor(timeDiff / 1000);
    this.hours = Math.floor(totalSeconds / 3600);
    this.minutes = Math.floor((totalSeconds % 3600) / 60);
    this.seconds = totalSeconds % 60;
    this._cdRef.detectChanges();
  }

  private updateTimeFilial(timeDiff: number) {
    const totalSeconds = Math.floor(timeDiff / 1000);
    this.filialHours = Math.floor(totalSeconds / 3600);
    this.filialMinutes = Math.floor((totalSeconds % 3600) / 60);
    this.filialSeconds = totalSeconds % 60;
    this._cdRef.markForCheck();
  }
}
