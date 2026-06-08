import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { RightBarService } from '../../../../right-bar/services/right-bar.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-oper-day',
    imports: [
        NgOptimizedImage,
        MatMenu,
        MatMenuTrigger,
        MatTooltip
    ],
    templateUrl: './oper-day.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperDayComponent implements OnInit {
  @Output() docDate = new EventEmitter();
  operDay!: any;
  selectedOperDate = '';
  tooltipText = '';

  timeInterBank: string | null = null;
  timeInterBranch: string | null = null;
  private targetTimeInterBranch: Date | null = null;
  private targetTimeInterBank: Date | null = null;

  constructor(
    private rightBarService: RightBarService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  changeTooltip() {
    const active = this.operDay?.lastWorkingDateAvailable ? 'включен' : 'выключен';
    this.tooltipText = `Переключение опер дня: ${active}`;
  }

  ngOnInit() {
    this.rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.operDay = res;
            this.selectedOperDate = this.operDay.currentWorkingDate
            this.emitDate(this.selectedOperDate);
            this.setTargetTime(this.operDay.interbank, this.operDay.interbranch);
            this.startCountdown();
            this._cdRef.markForCheck();
          }
        }
      })
  }

  emitDate(dateString: string) {
    const date = this.convertToDate(dateString);
    this.changeTooltip();
    this.docDate.emit(date);
  }

  convertToDate(dateString: string) {
    const [day, month, year] = dateString.split('.').map(Number);
    // Month is 0-based, so subtract 1
    const date = new Date(year, month - 1, day);
    const timezoneOffset = date.getTimezoneOffset();

    return new Date(date.getTime() - timezoneOffset * 60000);
  }

  private setTargetTime(timeString: string, timeStr: string): void {
    if(!timeString || !timeStr) return;
    const now = new Date();
    const [hours, minutes] = timeString?.split(':').map(Number);
    this.targetTimeInterBank = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    const [h, m] = timeStr?.split(':').map(Number);
    this.targetTimeInterBranch = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      m,
      0
    );

    // If the target time has already passed, set it to tomorrow
    // if (this.targetTimeInterBank < now) {
    //   this.targetTimeInterBank.setDate(this.targetTimeInterBank.getDate() + 1);
    // }
  }

  private startCountdown(): void {
    setInterval(() => {
      if (this.targetTimeInterBank) {
        const now = new Date();
        const diff = this.targetTimeInterBank.getTime() - now.getTime();

        if (diff <= 0) {
          this.timeInterBank = '00:00:00';
        } else {
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          this.timeInterBank = `${this.pad(hours)}:${this.pad(
            minutes
          )}:${this.pad(seconds)}`;
          this._cdRef.markForCheck();
        }
      }

      if (this.targetTimeInterBranch) {
        const now = new Date();
        const diff = this.targetTimeInterBranch.getTime() - now.getTime();

        if (diff <= 0) {
          this.timeInterBranch = '00:00:00';
        } else {
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          this.timeInterBranch = `${this.pad(hours)}:${this.pad(
            minutes
          )}:${this.pad(seconds)}`;
          this._cdRef.markForCheck();
        }
      }
    }, 1000);
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  selectWorkingDate(date: string) {
    this.selectedOperDate = date;
    this.emitDate(this.selectedOperDate);
    this._cdRef.markForCheck()
  }
}
