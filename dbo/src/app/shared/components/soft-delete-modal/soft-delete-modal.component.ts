import {ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-soft-delete-modal',
  templateUrl: './soft-delete-modal.component.html',
  styleUrls: ['./soft-delete-modal.component.css']
})
export class SoftDeleteModalComponent implements OnInit, OnDestroy {
  @Input() seconds = 5;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  cf = inject(ChangeDetectorRef)

  timeLeft!: number;
  private timerId: any;

  ngOnInit() {
    this.timeLeft = this.seconds;

    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.cf.detectChanges();
      if (this.timeLeft === 0) {
        this.onConfirm();
      }
    }, 1000);
  }

  onCancel() {
    this.clearTimer();
    this.cancel.emit();
  }

  onConfirm() {
    this.clearTimer();
    this.confirm.emit();
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
