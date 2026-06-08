import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loan-status-indicator',
    imports: [CommonModule],
    templateUrl: './loan-status-indicator.component.html',
    styles: [
        `
      .progress-bar-container {
        width: 100%;
        height: 17px;
        background-color: #f2f2f2;
        border-radius: 40px;
        overflow: hidden;
        background: #e5f5e9;
      }
      .progress-bar {
        border-radius: 40px;
        height: 100%;
        background-color: #e5f5e9;
        transition: width 0.6s ease-in-out; /* Add animation for smooth transition */
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanStatusIndicatorComponent implements OnInit {
  percentage: number = 0;
  @Input() totalSum: number = 0;
  @Input() mainDebt: number = 0;
  @Input() color = '#05bc74'

  constructor(private cf: ChangeDetectorRef) {}
  ngOnInit(): void {
    setTimeout(() => {
      if (this.totalSum > 0) {
        this.percentage = 100- Math.floor((this.mainDebt / this.totalSum) *100);
      } else {
        this.percentage = 0;
      }
      this.cf.markForCheck();
    }, 400);
  }
}
