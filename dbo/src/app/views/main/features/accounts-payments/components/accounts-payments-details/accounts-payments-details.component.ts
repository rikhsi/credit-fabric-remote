import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Inject,
  OnInit,
  signal
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { AccountInfoDto } from '../../models/accounts-payments.model';
import { NgxMaskPipe } from "ngx-mask";
import { MatMenu } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { SelectActionComponent } from '../../../../../../shared/components/select-action/select-action.component';
import { ISelectAction } from '../../../../../../shared/interfaces/select-actions.interface';
import { Router, RouterLink } from '@angular/router';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../../../core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../../../../../core/services/account.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-accounts-payments-details',
    imports: [CommonModule, MatIconModule, UiSvgIconComponent, NgxMaskPipe, MatMenu, NgOptimizedImage, MatTooltip, SelectActionComponent, RouterLink, MatDialogClose],
    templateUrl: './accounts-payments-details.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsPaymentsDetailsComponent implements OnInit {
  protected readonly Math = Math;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: DialogRef,
    private cdRef: ChangeDetectorRef,
    private matDialogRef: MatDialogRef<AccountsPaymentsDetailsComponent>,
    private matDialog: MatDialog,
    private templateService: TemplateService,
    private router: Router,
    private clipBoard: Clipboard,
    private toastrService: ToastrService,
    private userService: UserService,
    private destroyRef: DestroyRef,
    private accountService: AccountService,
    private translateService:TranslateService
  ) {}
  accountHistory: any = []

  ngOnInit() {
    this.getUserInfo();
    console.log(this.data)
  }

  getUserInfo() {
    // this.userService.userInfo$$
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(user => {
    //     if(user) {
    //       this.data.name = user.business.name;
    //       this.data.bankName = 'АКБ "HAMKOR BANK"';
    //       this.data.swift = 'ASACUZ22XXX';
    //     }
    //   })
  }

  getAccountHistory() {
    const accountId = localStorage.getItem('accountId');
    this.accountService.getAccountHistoryV2({ id: accountId as string, date: { dateBegin: "01-08-2025", dateClose: "15-08-2025" }, paging: { page: 1, size: 5 } })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(accountHistory => {
      console.log(accountHistory.content)
      this.accountHistory = accountHistory.content;
      this.cdRef.detectChanges();
    })
    this.cdRef.detectChanges();
  }

  closeDialog() {
    this.matDialogRef.close();
  }

  actions: ISelectAction[] = [
    {
      title: 'Закрыть счёт',
      id: 'close',
    },
  ];

  onAction(action: ISelectAction) {
    switch (action.id) {
      case 'history':
        this.openHistory();
        break;
      case 'close':
        this.closeAccount();
        break;
      default:
    }
  }

  exportToExcel() {
    this.accountService.exportAccountDetailToExcel(this.data);
  }

  async printAccDetailsPdf() {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/account-details.mustache',
      templateData: {
        ...this.data,
        status: this.data.active ? 'Активный' : 'Неактивный',
        balanceAmount: Math.floor(Number(this.data.balance.amount / 100)) + Math.floor(Number((this.data.balance.amount / 100))).toString().padStart(2, '0')
      },
      templateName: 'account-details'
    };
    await this.templateService.showPdfInDialog(options);
  }

  copy() {
    const integer = Math.floor(this.data.balance.amount / 100);
    const decimal = (this.data.balance.amount % 100).toString().padStart(2, '0')
    const amount = `${integer},${decimal} ${this.data.balance.currency}`
    const formattedText =
      `${this.translateService.instant('createPayment.name')}: ${this.data.holderInfo}\n` +
      `Номер счета: ${this.data.accountNumberCard}\n` +
      `${this.translateService.instant('createPayment.inn')}: ${this.data.inn}\n` +
      `${this.translateService.instant('main.currency')}: ${this.data.balance.currency}\n` +
      `${this.translateService.instant('new.mfo')}: ${this.data.mfo}\n` +
      `${this.translateService.instant('new.bank_name')}: ${this.data.bankName}\n` +
      `SWIFT: ${this.data.swift}\n` +
      `${this.translateService.instant('new.status')}: ${this.data.active ? this.translateService.instant('loans.active') : 'Неактивный'}`;

    const cleanedText = formattedText
      .replace(/[^\S\r\n]+/g, ' ')
      .trim();

    this.toastrService.info(this.translateService.instant('new.details_copied'));
    this.clipBoard.copy(cleanedText);
  }

  openHistory() {
    this.router.navigate(['account-history', this.data.id], {
      queryParams: {
        accountNumber: this.data.altAcctId,
      }
    });
    this.matDialogRef.close('history');
  }

  closeAccount() {
    this.matDialog.open(DeleteAccountComponent, {
      width: '720px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: { accountNumber: [this.data.accountNumberCard] }
    })
  }
}
