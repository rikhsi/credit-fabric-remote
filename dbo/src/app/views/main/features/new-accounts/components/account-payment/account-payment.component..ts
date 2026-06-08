import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit, output } from '@angular/core';
import { NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { MatDialog } from '@angular/material/dialog';
import { TransactionDetailComponent } from '../../../transaction-detail/transaction-detail.component';
import { getStatusApplication } from '../../../../../../core/utils/mixin.utils';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { TransactionService } from "../../../../../../core/services/transaction.service";
import { Router } from "@angular/router";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { EspSignConfirmComponent } from 'src/app/core/components/esp-sign-confirm/esp-sign-confirm.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-account-payment',
  imports: [
    NgxMaskPipe,
    NgClass,
    NgIf,
    MatMenu,
    MatMenuTrigger,
    SvgIconComponent,
    NgFor,
    TranslateModule
  ],
  templateUrl: './account-payment.component.html',
  styles: ``,
  styleUrls: ['./account-payment.component..scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountPaymentComponent {
  @Input() transaction!: any;
  @Input() onClickShowDetail = false;
  @Input() hideStatus = false;
  private readonly transactionService = inject(TransactionService)
  backAction = output<string>()

  constructor(
    private _matDialog: MatDialog,
    private router: Router,
    private translateService:TranslateService
  ) {
  }

  transactionName(transaction) {
    // transaction.sender.name : transaction.recipient.name
    if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && transaction.isDebit) {
      return transaction.additionalInfo.pan
    } else if (transaction.transactionMode === 'TRANSACTION' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TRANSACTION' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'BUDGET' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'BUDGET' && transaction.isDebit) {
      return transaction.recipient.name
    }
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  printPdf(id: string) {
    this.transactionService.generatePDF(id).subscribe(transaction => {
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
        console.error("PDF fayl topilmadi!");
      }
    });
  }

  // formatDate(dateString: string): string {
  //   const date = new Date(dateString);

  //   return new Intl.DateTimeFormat("ru-RU", {
  //     day: "2-digit",
  //     month: "long",
  //     hour: "2-digit",
  //     minute: "2-digit"
  //   }).format(date);
  // }


  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

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

    const monthKey = translateMonths[parseInt(month, 10) - 1];
    const monthName = this.translateService.instant(monthKey);

    return `${year} ${monthName} ${parseInt(day, 10)}, ${hour}:${minute}`;
  }



  subscribe(event: Event) {
    event.stopPropagation();
  }

  handleEdit(event: Event) {
    event.stopPropagation();
    this.editPayment(this.transaction)
  }
  handleComment(event: Event) {
    event.stopPropagation();
  }

  editPayment(transaction) {
    if (transaction.transactionMode === "TRANSACTION") {
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction"
        },
      });
    } else if (transaction.transactionMode === "BUDGET" && transaction.additionalInfo.windowType !== 'BUDGET_INCOME') {
      this.router.navigate(['/payment/transfer-to-budget'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction"
        }
      });
    } else if (transaction.transactionMode === "BUDGET" && transaction.additionalInfo.windowType === 'BUDGET_INCOME') {
      this.router.navigate(['/payment/transfer-to-treasure'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction"
        }
      });
    } else if (transaction.transactionMode === "TO_PHYSICAL_CARD") {
      this.router.navigate(['/payment/transfer-to-card'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction"
        }
      });
    } else {
      this.router.navigate(['/payment/transfer-to-corporate-card'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction"
        }
      });
    }
  }

  onSubAction(action: { id: string; title: string }) {
    this._matDialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: { action: {externalId: this.transaction.id, action: action.id, type: this.transaction.transactionMode, successMessage: 'Успешно!'}, transaction: {} },
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            // this.onDetail.emit('sign')
          }
        }
      });
  }

  getActions() {
    if (this.transaction.buttons.length > 0) {
      return this.transaction.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }

  showDetails() {
    const dialog = this._matDialog.open(TransactionDetailComponent, {
      width: '475px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: this.transaction,
    });
    dialog.componentInstance.onDetail.subscribe(res => {
      this.backAction.emit(res)
      dialog.close()
    })

  }
  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApplication;
  protected readonly console = console;
  protected readonly Number = Number;
}
