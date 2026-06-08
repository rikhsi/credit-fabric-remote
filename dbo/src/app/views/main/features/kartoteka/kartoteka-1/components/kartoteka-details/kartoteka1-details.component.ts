import { NgxMaskPipe } from "ngx-mask";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnInit, signal } from '@angular/core';


import { docType } from '../../../../../../../core/utils/mixin.utils';

import { NgIf } from "@angular/common";
import { MatDivider } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateModule, TranslateService } from "@ngx-translate/core"
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Kartoteka1PayDialogComponent } from '../modals/full-pay/kartoteka-pay';
import { Kartoteka1AcceptDialogComponent } from '../modals/accept/kartoteka-accept';
import { Kartoteka1RejectDialogComponent } from '../modals/reject/kartoteka-reject';


import { KartotekaContent, KartotekaTransactions } from '../../../models/kartoteka.model';
import { KartotekaService } from '../../../services/kartoteka.service';


import { Kartoteka2Store } from '../../../store/kartoteka2.store';
import { BaseKartotekaStore } from '../../../store/base-kartoteka-store';
import { AmountService } from '../../../../../../../core/services/amount.service';
import { Kartoteka1MoveTo2DialogComponent } from "../modals/move-to-kartoteka-2/kartoteka-move";


@Component({
  selector: 'app-kartoteka1-details',
  imports: [
    FormsModule,
    NgxMaskPipe,
    ReactiveFormsModule,
    MatDivider,
    NgIf,
    TranslateModule,
    Kartoteka1AcceptDialogComponent
  ],
  templateUrl: './kartoteka1-details.component.html',
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
  styleUrl: "./kartoteka-details-skeleton.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class Kartoteka1DetailsComponent implements OnInit {
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
  protected baseKartotekaStore = inject(BaseKartotekaStore)
  private readonly dialog = inject(MatDialog)
  constructor(
    private matDialogRef: MatDialogRef<Kartoteka1DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: KartotekaContent },
  ) {
  }


  ngOnInit() {
    if (this.data.card.documentId) {
      this.getCardIndexTransactionList(this.data.card.documentId);
      this.baseKartotekaStore.getKartotkekaOne(this.data.card.documentId);
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

  copyAllPayment(){

    // const parts = [
    //   `Оплачено: ${this.baseKartotekaStore?.kartotekaData()?.amountPayed  ? (this.baseKartotekaStore?.kartotekaData()?.amountPayed / 100) : ''}`,
    //   `Отклонено: ${this.baseKartotekaStore.kartotekaData()?.amountRejected  ? this.baseKartotekaStore.kartotekaData()?.amountRejected / 100 : ''}`,
    //   `Остаток: ${this.baseKartotekaStore.kartotekaData()?.sumSaldo  ? this.baseKartotekaStore.kartotekaData()?.sumSaldo / 100 : ''}`,
    // ];

    const data = this.baseKartotekaStore?.kartotekaData();

    const parts = [
      `Оплачено: ${data?.amountPayed ? data.amountPayed / 100 : ''}`,
      `Отклонено: ${data?.amountRejected ? data.amountRejected / 100 : ''}`,
      `Остаток: ${data?.sumSaldo ? data.sumSaldo / 100 : ''}`,
    ];

    const text = parts.join('\n');

    this.copyToClipboard(text)
      .then(() => this.showMessage())
      .catch(() => this.fallbackCopy(text));
  }

  // COPY ONE
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

  protected readonly docType = docType;
  protected readonly Math = Math;



  protected fullPayPaymentDialog(): void {
    this.dialog.open(Kartoteka1PayDialogComponent, {
      data: { card: this.baseKartotekaStore.kartotekaData() },
      width: '548px',
    });

  }


  protected rejectPaymentDialog(): void {
    this.dialog.open(Kartoteka1RejectDialogComponent, {
      data: { card: this.baseKartotekaStore.kartotekaData() },
      width: '548px',
    });

  }

  protected acceptPaymentDialog(): void {
    this.dialog.open(Kartoteka1AcceptDialogComponent, {
      data: { card: this.baseKartotekaStore.kartotekaData() },
      width: '548px',
    });

  }

   protected movePaymentDialog(): void {
    this.dialog.open(Kartoteka1MoveTo2DialogComponent, {
      data: { card: this.baseKartotekaStore.kartotekaData() },
      width: '548px',
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
    const entered = this.parseNumber(this.baseKartotekaStore.kartotekaData()!.sumDoc ? this.baseKartotekaStore.kartotekaData()!.sumDoc / 100 : 0);

    return entered ? this.amountService.numberToWordsRU(entered) : ""
  }
}
