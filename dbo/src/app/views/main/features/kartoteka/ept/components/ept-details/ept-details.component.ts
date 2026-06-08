import { NgxMaskPipe } from "ngx-mask";
import { NgIf } from "@angular/common";
import { MatDivider } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateModule, TranslateService } from "@ngx-translate/core"
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Kartoteka2Store } from '../../../store/kartoteka2.store';
import { BaseKartotekaStore } from '../../../store/base-kartoteka-store';


@Component({
  selector: 'app-ept-details',
  imports: [
    FormsModule,
    NgxMaskPipe,
    ReactiveFormsModule,
    MatDivider,
    NgIf,
    TranslateModule,
  ],
  templateUrl: './ept-details.component.html',
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



export class EPTDetailsComponent {
  copyMessage = signal<string | null>(null);
  private _snackBar = inject(MatSnackBar);
  protected translate = inject(TranslateService);
  protected kartoteka2Store = inject(Kartoteka2Store)
  protected baseKartotekaStore = inject(BaseKartotekaStore)
  protected data = inject(MAT_DIALOG_DATA)
  private matDialogRef = inject(MatDialogRef<EPTDetailsComponent>)



  protected getSelectedStatus(status: string): { name: string; value: string; img: string } | null {
    const selectedStatus = status;
    if (!selectedStatus) return null;

    return this.kartoteka2Store.statusListToMap().find(res => res.value === selectedStatus) || null;
  }

  closeDialog() {
    this.matDialogRef.close();
  }


  //   Copy to board

  copyAllUsersDetails(): void {
    const isIncoming = this.data.activeTab === 'INCOMING';

    const text = `
     ${isIncoming ? 'Банк получателя' : 'Банк плательщика'}: ${isIncoming ? this.data?.payeeBank : this.data?.payerBank}
     ${isIncoming ? 'Филиал банка получателя' : ' Филиал банка плательщика'}: ${isIncoming ? this.data?.payeeBranch : this.data?.payerBranch}
     ${isIncoming ? 'Счёт получателя' : 'Счёт плательщика'}: ${isIncoming ? this.data?.payeeAccount : this.data?.payerAccount}
     ${isIncoming ? 'ИНН/ПИНФЛ получателя' : 'ИНН/ПИНФЛ плательщика'}: ${isIncoming ? this.data?.payeeInn : this.data?.payerInn}
     ${isIncoming ? 'Наименование получателя' : 'Наименование плательщика'}: ${isIncoming ? this.data?.payeeName : this.data?.payerName}
     `;

    const result = text.trim();

    this.copyToClipboard(result)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }


  copyAll(): void {
    const text = `
     ${'Тип требования'}: ${ this.data?.paymenType}
     ${'Код назначения требования' }:${this.data?.purposeCode}
     ${'Назначение требования'}: ${this.data?.purpose}`;


    const result = text.trim();
    this.copyToClipboard(result)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  copySingle(value: any | undefined) {
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

 protected Math = Math
}