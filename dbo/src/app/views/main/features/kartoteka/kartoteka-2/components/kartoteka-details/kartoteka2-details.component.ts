import { NgxMaskPipe } from "ngx-mask";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnInit, signal } from '@angular/core';


import { docType } from '../../../../../../../core/utils/mixin.utils';

import { NgIf } from "@angular/common";
import { MatDivider } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateModule, TranslateService } from "@ngx-translate/core"
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';




import { KartotekaContent, KartotekaTransactions } from '../../../models/kartoteka.model';
import { KartotekaService } from '../../../services/kartoteka.service';


import { Kartoteka2Store } from '../../../store/kartoteka2.store';
import { AmountService } from '../../../../../../../core/services/amount.service';
import {Kartoteka2Service} from "../../../../kartoteka-old/kartoteka-1/services/kartoteka2.service";


@Component({
  selector: 'app-kartoteka2-details',
  imports: [
    FormsModule,
    NgxMaskPipe,
    ReactiveFormsModule,
    MatDivider,
    NgIf,
    TranslateModule
  ],
  templateUrl: './kartoteka2-details.component.html',
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


export class Kartoteka2DetailsComponent implements OnInit {
  protected kartoteka2service = inject(Kartoteka2Service)

  documentId: string | null = ''
  name: string | null = ''
  isFetching = false
  transactionList: KartotekaTransactions[] = [];
  #destroy = inject(DestroyRef);
  private _cf = inject(ChangeDetectorRef);
  private kartotekaService = inject(KartotekaService);
  private amountService = inject(AmountService);
  copyMessage = signal<string | null>(null);
  private _snackBar = inject(MatSnackBar);
  protected translate = inject(TranslateService);
  protected kartoteka2Store = inject(Kartoteka2Store)

  constructor(
    private matDialogRef: MatDialogRef<Kartoteka2DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: KartotekaContent },
  ) {
  }


  ngOnInit() {
    if (this.data.card.documentId) {
      this.getCardIndexTransactionList(this.data.card.documentId);
    }
  }



  getCardIndexTransactionList(documentId: number | null) {
    this.isFetching = true
    this.kartotekaService.getCardFilesTransactions(documentId).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
      if (!res) return
      this.transactionList = res.transacts.sort((a, b) => {
        const dateA = new Date(a.executeTime.split('.').reverse().join('-'));
        const dateB = new Date(b.executeTime.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      this.isFetching = false
      this._cf.detectChanges();
    })
  }


  convertAmountToWord(amount: number) {
    return this.amountService.numberToWordsRU(amount);
  }

  closeDialog() {
    this.matDialogRef.close();
  }

  formatSum(value: number) {
    return (value / 100).toLocaleString('ru-RU', { useGrouping: true });
  };

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long'
    }).format(date);

    const year = date.getFullYear();

    return `${formattedDate} ${year}`;
  }

  // COPY ALL
  copyAll() {
    const t = this.translate.instant.bind(this.translate);
    const card = this.data.card;
    const parts = [
      `${t('cardFileTwo.recipient_alt2')}: ${card.coName ?? ''}`,
      `${t('createPayment.inn')}: ${card.coInn ?? ''}`,
      `${t('cardFileTwo.recipient_account')}: ${card.coAcc ?? ''}`,
      `${t('cardFileTwo.bank_mfo')}: ${card.codeFilial ?? ''}`,

    ];
    const text = parts.join('\n');

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  // COPY ONE
  copySingle(value: string | null | undefined) {
    const text = value ?? '';
    if (!text) {
      this.showMessage();
      return;
    }

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API not available');
    }
  }

  protected getSelectedStatus(status: string): { name: string; value: string; img: string } | null {
    const selectedStatus = status;
    if (!selectedStatus) return null;

    return this.kartoteka2Store.statusListToMap().find(res => res.value === selectedStatus) || null;
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
  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    // убираем пробелы и заменяем запятую на точку
    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  convertAmountIntoWords() {
    const entered = this.parseNumber(this.data?.card?.sumDoc ? this.data?.card?.sumDoc  / 100 : 0);

    return entered ? this.amountService.numberToWordsRU(entered) : ""
  }
  copyAllPayment(){



    const parts = [
      `Оплачено: ${this?.data.card?.sumDoc && this?.data.card?.sumSaldo ? (this?.data.card?.sumDoc - this?.data?.card?.sumSaldo) / 100 : ''}`,
      `Остаток: ${Math.floor(this.data.card.sumSaldo / 100)  ? this.data.card.sumSaldo  / 100 : ''}`,
    ];

    const text = parts.join('\n');

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  protected readonly docType = docType;
  protected readonly Math = Math;
  protected downloadPdf() {
    if (!this.data?.card?.documentId) return ;
    this.kartoteka2service
      .getFileById({ documentId: this.data?.card?.documentId, fileType: "PDF" })
      .subscribe((transaction) => {
        if (transaction?.file) {
          const byteCharacters = atob(transaction.file);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `transaction-${this.data?.card?.documentId}.pdf`;
          link.click();

          URL.revokeObjectURL(link.href);
        } else {
          console.error('PDF file not found!');
        }
      });
  }

  // PRINT PDF
  // async printAccDetailsPdf() {
  //   const data = this.transactionList.map(el => {
  //     el.sumOstatok = this.formatSum(el.sumSaldo);
  //     el.sumOplata = this.formatSum(el.sumPay);
  //     return el;
  //   })
  //   const options: Options = {
  //     templateLang: 'ru',
  //     templateLogo: undefined,
  //     templatePath: '/kartoteka-operations.mustache',
  //     templateData: {
  //       card: this.data.card,
  //       data
  //     },
  //     templateName: 'операции по картотеке'
  //   };
  //   await this.templateService.showPdfInDialog(options);
  // }

}

