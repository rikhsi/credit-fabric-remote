import { LoanLogicService } from './../../services/loan-logic.service';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskPipe } from 'ngx-mask';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { LoanDetailDto } from '../../models/loan.modal';
 
@Component({
  selector: 'app-loan-detail-modal',
  imports: [
     MatDivider,
    NgIf,
    MatIconModule,
    TranslateModule,
    NgxMaskPipe,
    SvgIconComponent,
  ],
  providers:[LoanLogicService],
  templateUrl: './loan-detail-modal.component.html',
  styles: `
      .label {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      }
      .value {
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDetailModalComponent {
 public data: LoanDetailDto = inject(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  protected readonly _matDialogRef = inject(MatDialogRef<LoanDetailModalComponent>);
  public loanLogicService = inject(LoanLogicService);



  closeDialog(): void {
    this._matDialogRef.close();
  }
 
  copy(value: string): void {
    navigator.clipboard.writeText(value);
    this.snackBar.open(
      `${this.translateService.instant('new.copied')}! ✅`,
      this.translateService.instant('new.close_1'),
      { duration: 3000 }
    );
  }
 
  /**
   * Formats dates from common backend formats:
   * - "DD.MM.YYYY HH:mm"  (e.g. "20.03.2025 13:26")
   * - "YYYY-MM-DD"        (e.g. "2025-04-01")
   * - ISO 8601            (e.g. "2025-04-01T00:00:00")
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
 
    // Format: "DD.MM.YYYY HH:mm"
    if (dateStr.includes('.')) {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('.');
 
      const translateMonths = [
        'new.january', 'new.february', 'new.march', 'new.april',
        'new.may', 'new.june', 'new.july', 'new.august',
        'new.september', 'new.october', 'new.november', 'new.december'
      ];
 
      const monthKey = translateMonths[parseInt(month, 10) - 1];
      const monthName = this.translateService.instant(monthKey);
 
      if (timePart) {
        const [hour, minute] = timePart.split(':');
        return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
      }
      return `${parseInt(day, 10)} ${monthName} ${year}`;
    }
 
    // Format: "YYYY-MM-DD" or ISO
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
 
    const translateMonths = [
      'new.january', 'new.february', 'new.march', 'new.april',
      'new.may', 'new.june', 'new.july', 'new.august',
      'new.september', 'new.october', 'new.november', 'new.december'
    ];
 
    const monthKey = translateMonths[date.getMonth()];
    const monthName = this.translateService.instant(monthKey);
    return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
  }
}
