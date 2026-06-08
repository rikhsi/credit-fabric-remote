// Angular
import { Router } from "@angular/router";
import { NgxMaskPipe } from 'ngx-mask';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { getStatusApplication } from '../../../../../../../core/utils/mixin.utils';
import { HistoryRequisitesComponent } from "../../dialogs/history-requesite/requisite";
import { CorpCardService } from "../../../services/corp-card.service";
import { HistorySignModalComponent } from "src/app/shared/components/history-sign-modal/history-sign-modal";
import {MatTooltipModule} from "@angular/material/tooltip";


@Component({
  selector: 'CorpCardHistoryTable',
  imports: [
    NgxMaskPipe,
    NgClass,
    NgIf,
    MatMenu,
    MatMenuTrigger,
    NgOptimizedImage,
    TranslateModule,
    MatTooltipModule
  ],
  templateUrl: './table.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class PaymentComponent {
  private router = inject(Router)
  private dialog = inject(MatDialog)
  private snackBar = inject(MatSnackBar);
  private corpCardService = inject(CorpCardService);
  private translate = inject(TranslateService);
  @Input() transaction!: any;


  protected openHistoryRequisites() {
    this.dialog.open(HistoryRequisitesComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: {
        ...this.transaction,
        hasTerminalId:true
      },
    });

  }

  //  Пополнить
  protected fromAccountToCard(transactionId: string) {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        transactionId: transactionId,
        type: "repeat"
      }
    });
  }

  // Возврат на счет
  protected fromCardToAcccount(transactionId: string) {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        transactionId: transactionId,
        type: "repeat"
      }
    });
  }


  // Поделиться
  share(): void {
    const t = this.translate.instant.bind(this.translate);
    const text = this.buildCardDetails(this.transaction);

    if (navigator.share) {
      navigator
        .share({ title: t('new.card_details'), text })
        .then(() => this.showMessage(`${t('new.shared')} ✅`))
        .catch((err) => {
          console.error('Share error:', err);
          this.showMessage(t('new.failed_to_share'), true);
        });
    }
  }

  private buildCardDetails(data: any): string {
    const t = this.translate.instant.bind(this.translate);

    const fields = [
      `${t('accounts.organization_name')}: ${this.transaction?.merchantName ?? '-'}`,
      `${t('accounts.card_number')}: ${data.pan ?? ''}`,
      `${t('myAccounts.operation_type')}: ${this.transaction?.statusNameFront ?? ''}`,
      `${t('myAccounts.status')}: ${this.transaction?.statusNameFront ?? ''}`,
      `${t('accounts.transaction_amount')}: ${(this.transaction?.amount?.amount / 100).toFixed(2)} ${this.transaction?.amount?.currency ?? ''}`,
      `${t('accounts.transaction_fee')}: ${(this.transaction?.commission?.amount / 100).toFixed(2)} ${this.transaction?.commission?.currency ?? ''}`,
      `${t('accounts.transaction_date')}: ${this.formatDocDate(this.transaction?.date)} ${this.transaction?.time ?? ''} `,
      `${t('accounts.transaction_description')}:  ${this.transaction?.description ?? ''}`,
    ];
    return fields.join('\n').trim();
  }


  private showMessage(msg?: string, isError = false): void {
    const t = this.translate.instant.bind(this.translate);
    this.snackBar.open(`${msg ? t(msg) : t('new.copied')} ✅`, `${t('global.close')}`, {
      duration: isError ? 4000 : 2500,
      panelClass: isError ? ['snackbar-error'] : ['snackbar-success'],
    });
  }


  // Печать
  protected printPdf(transactionId: string) {
    this.corpCardService.corpCardTransactionHistoryPDF({ id: transactionId }).subscribe(transaction => {
      if (transaction?.file) {
        const byteCharacters = atob(transaction.file);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
      } else {
        console.error(this.translate.instant('new.completed_with_an_error'));
      }
    });
  }



  protected formatDocDate(dateString: string,): string {
    const [year, month, day] = dateString?.split('-');

    const translateMonths = [
      'new.january',
      'new.february',
      'new.march',
      'new.april',
      'new.may',
      'new.june',
      'new.july',
      'new.august',
      'new.september',
      'new.october',
      'new.november',
      'new.december'
    ];

    const monthIndex = Number(month) - 1;
    const monthKey = translateMonths[monthIndex];
    const monthName = this.translate?.instant(monthKey);

    return `${Number(day)} ${monthName} ${year}`;
  }


  protected checkProcessing(processing: string): boolean {
    if (!processing) {
      return false;
    } else {
      return (processing && processing.toLowerCase() === 'dbo') ? true : false;
    }
  }

  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApplication;
}





