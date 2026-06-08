import { MatDivider } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateModule, TranslateService } from "@ngx-translate/core"
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';




@Component({
  selector: 'app-bron-details',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDivider,
    TranslateModule,
  ],
  templateUrl: './bron-details.component.html',
  styles: `
    .snackbar-success {
      background-color: #008C79 !important;
      color: #fff !important;
      font-weight: 500;
      border-radius: 12px !important;
    }
    .mat-mdc-snack-bar-label {
      font-size: 14px !important;
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class BronDetailsComponent implements OnInit {
  copyMessage = signal<string | null>(null);
  private _snackBar = inject(MatSnackBar);
  protected translate = inject(TranslateService);
  protected data = inject(MAT_DIALOG_DATA)
  private matDialogRef = inject(MatDialogRef<BronDetailsComponent>)


  ngOnInit(): void {
    console.log(this.data, 'datatatata')
  }


  protected formatMoney(value: number | string): { formattedInteger: any, decimal: any } {
    if (!value) return { formattedInteger: 0, decimal: 0 }
    const num = Number(value);
    const [integer, decimal] = num.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return { formattedInteger, decimal };
  }

  protected copyAll(): void {

    const sumReserved = this.formatMoney((this.data?.sumReserved ?? 0) / 100);
    const bronToPay = this.formatMoney((this.data?.BronToPay ?? 0) / 100);
    const sumPaid = this.formatMoney((this.data?.sumPaid ?? 0) / 100);
    const sumUnlead = this.formatMoney((this.data?.sumUnlead ?? 0) / 100);

    const text = `
Зарплатный период: ${this.data?.period ?? ''}

Счет клиента: ${this.data?.clAccount ?? ''}

Накопленная сумма брони: ${sumReserved.formattedInteger}.${sumReserved.decimal} UZS

Доступная сумма брони: ${bronToPay.formattedInteger}.${bronToPay.decimal} UZS

Оплаченная сумма брони: ${sumPaid.formattedInteger}.${sumPaid.decimal} UZS

Оплаченная и непроведенная сумма брони: ${sumUnlead.formattedInteger}.${sumUnlead.decimal} UZS

Назначение платежа брони: ${this.data?.purposeName ?? ''}
  `.trim();

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  protected copySingle(value: any | undefined) {
    const text = value ?? '';
    if (!text) {
      this.showMessage();
      return;
    }

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  private fallbackCopy(text: string) {
    const t = this.translate.instant.bind(this.translate);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        this.showMessage();
      }
    } catch {

      this.showMessage(t('new.web_share_is_not_supported_and_copying_failed'));
    }
  }

  private showMessage(msg?: string) {
    const t = this.translate.instant.bind(this.translate);
    this._snackBar.open(`${msg ? msg : t('new.copied')} ✅`, `${t('global.close')}`, {
      duration: 3000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API not available');
    }
  }

  closeDialog() {
    this.matDialogRef.close();
  }
}