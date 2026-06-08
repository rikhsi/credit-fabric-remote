import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon, MatIconModule } from "@angular/material/icon";

export interface InterestScheduleItem {
  month: string;
  amount: number;
  currency: string;
}

export interface InterestScheduleData {
  items: InterestScheduleItem[];
}

@Component({
  selector: 'app-interest-schedule-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule, MatIconModule],
  templateUrl: './interest-schedule-modal.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush
  
})
export class InterestScheduleModalComponent {

  private dialogRef = inject(MatDialogRef<InterestScheduleModalComponent>);
  public readonly data = inject(MAT_DIALOG_DATA);




  close(): void {
    this.dialogRef.close();
  }

  requestCertificate(): void {
    this.dialogRef.close({ action: 'request_certificate' });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('ru-RU').replace(/,/g, ' ');
  }
}