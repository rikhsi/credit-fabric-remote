// Angular
import { NgxMaskPipe } from "ngx-mask";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Component, DestroyRef, inject, input, output } from '@angular/core';


import { ToastrService } from "ngx-toastr";
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { CardTransaction } from '../../../model/transaction-history.model';

import { TransactionService } from "src/app/core/services/transaction.service";
import { EspSignConfirmComponent } from "src/app/core/components/esp-sign-confirm/esp-sign-confirm.component";
import { actionButtons } from "../../../constants/corp-card-constants";
import { HistorySignModalComponent } from "src/app/shared/components/history-sign-modal/history-sign-modal";
import {FirebaseAnalyticsService} from "../../../../../../../../../firebase-analytics.service";




@Component({
  selector: 'history-detail',
  templateUrl: './requisite.html',
  imports: [
    NgIf,
    NgForOf,
    NgOptimizedImage,
    NgxMaskPipe,
    MatMenu,
    MatMenuTrigger,
    MatDivider,
    SvgIconComponent,
    TranslateModule,
  ],
  styles: `
    .label {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color:#A3A3A3
    }
    .value {
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      color:#171717;
    }
  `
})


export class HistoryRequisitesComponent {
  public readonly onDetail = output<string>()
  public data: CardTransaction = inject(MAT_DIALOG_DATA)
  private readonly snackBar = inject(MatSnackBar)
  private readonly transactionService = inject(TransactionService)
  
  constructor(
    private router: Router,
    private _matDialog: MatDialog,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    protected dialog: MatDialogRef<HistoryRequisitesComponent>,
    private translate: TranslateService,
    private analyticsService: FirebaseAnalyticsService
  ) { }

  

  protected fromAccountToCard(transactionId: string) {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        transactionId: transactionId,
        type: "repeat",
        mode: 'CR'
      }
    });
    this.closeDialog()
  }

  protected fromCardToAccount(transactionId: string) {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        transactionId: transactionId,
        type: "repeat",
        mode: 'DR'
      }
    });
    this.closeDialog()
  }

  protected deleteTransaction(id: string) {
    this.transactionService.deleteTransaction(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.analyticsService.logFirebaseCustomEvent('delete_transfer_success', {transfer_id: id});

        if (res.msg) {

          this.toastrService.success(this.translate?.instant('new.successfully_deleted'));
        } else {
          const message = this.translate?.instant('myAccounts.error') ;
          this.toastrService.error(message)
        }
      },
      error: (err) => {
        const message = err.message || err || this.translate?.instant('myAccounts.error');
        this.toastrService.error(message)

      }
    })
    this.closeDialog();
  }


  // Helpers

  protected buttonActions(action: string, data: any) {
    if (action === 'reverse') {
      if (data.isCredit) {
        this.fromCardToAccount(data.id)
      } else {
        this.fromAccountToCard(data.id)
      }
    } else if (action === 'edit') {
      if (data.isCredit) {
        this.fromCardToAccount(data.id)
      } else {
        this.fromAccountToCard(data.id)
      }
    } else if (action === 'delete') {
      this.deleteTransaction(data.id)
    }
  }

  protected filteredButtons(data: any) {
    const allowedActions = this.getAllowedActions(data.status);

    return this.actionButtons.filter(btn => {
      if (!this.isProcessingAllowed(data.processing)) {
        return false;
      }
      if (!data.canUserSign) {
        return allowedActions
          .filter(action => action !== "sign")
          .includes(btn.action);
      }
      return allowedActions.includes(btn.action);
    });
  }

  protected getAllowedActions(status: string): string[] {
    const map: Record<string, string[]> = {
      PREPARE: ['sign', 'reverse', 'edit', 'delete'],
      IN_PROCESS: ['reverse'],
      SUCCESS: ['reverse'],
      DELETED_BY_BANK: ['reverse'],
      CANCEL: ['reverse'],
      ERROR: ['reverse'],
      REVERTED: ['edit'],
    };
    return map[status] ?? [];
  }


  protected isProcessingAllowed(processing?: string): boolean {
    return processing?.toLowerCase() === 'dbo';
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

  protected copy(data: any) {
    if (!data) return
    this.navigator.clipboard.writeText(data)
    this.snackBar.open( `${this.translate?.instant('new.copied')} ✅`, this.translate?.instant('new.close_1'), { duration: 3000 })
  }

  protected closeDialog() {
    this.dialog.close()
  }

  protected getActions() {
    if (this.data?.buttons?.length) {
      return this.data?.buttons?.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return (
      [{ title: "Подписать и отправить", id: "SIGN_AND_SEND", statusNameFront: "Создан" }]
    )
  }

  protected onSubAction(action: { id: string; title: string }) {
    const dialog = this._matDialog.open(HistorySignModalComponent, {
      data: {
        action: { externalId: this.data.id, action: action.id, type: "CORP_CARD_TOP_UP", successMessage: 'Успешно!' },
        transactionId: this.data.id,
        transaction: this.data
      }
    });
    dialog.componentInstance.onDetail.subscribe((res) => {
      // this.onDetail.emit(res);
      dialog.close();
    });
  }

  protected readonly Math = Math;
  protected readonly navigator = navigator;
  protected readonly actionButtons = actionButtons
}
