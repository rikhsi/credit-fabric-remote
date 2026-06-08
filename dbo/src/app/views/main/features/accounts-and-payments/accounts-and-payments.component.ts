import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit, signal,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {NgClass, NgForOf, NgIf } from '@angular/common';
import {
  ContainerTableComponent
} from '../../../../shared/components/common/container-table/container-table.component';
import {AccountService} from '../../../../core/services/account.service';
import {AccountsTableActionBtns} from './constants/table-btns';
import {
  AccountsTableColumnsHeaders,
  PaymentsTableColumnsHeaders
} from './constants/table-columns';
import {TableActionsComponent} from '../../../../shared/components/table-actions/table-actions.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AccountsDto, TransactionContent} from '../accounts-payments/models/accounts-payments.model';
import {TableColumn} from '../../../../shared/interfaces/table.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AccountsPaymentsDetailsComponent
} from '../accounts-payments/components/accounts-payments-details/accounts-payments-details.component';
import {MatDialog} from '@angular/material/dialog';
import {DeleteAccountComponent} from '../accounts-payments/components/delete-account/delete-account.component';
import {AccountsPaymentsService} from '../accounts-payments/services/accounts-payments.service';
import {FilterAccountComponent} from './components/filter-account/filter-account.component';
import {UtilsService} from '../../../../core/services/utils.service';
import {ToastrService} from 'ngx-toastr';
import {Options, TemplateService} from '../../../../core/services/template.service';
import {AmountService} from '../../../../core/services/amount.service';
import {getStatusApplication} from '../../../../core/utils/mixin.utils';
import {TransactionService} from '../../../../core/services/transaction.service';
import {ContainerNavComponent} from "../../../../shared/components/container-nav/container-nav.component";
@Component({
    selector: 'app-accounts-and-payments',
    imports: [
        NgClass,
        ContainerTableComponent,
        TableActionsComponent,
        FilterAccountComponent,
        NgForOf,
        NgIf,
        ContainerNavComponent,

    ],
    templateUrl: './accounts-and-payments.component.html',
    styles: ``,
    styleUrls: ['./accounts-and-payments.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsAndPaymentsComponent implements OnInit {
  @ViewChild('actionButtons') actionTemplate!: TemplateRef<any>;
  tableData: AccountsDto[] | TransactionContent[] = [];
  selectedRows: any[] = [];
  isLoading = signal(false)
  errorMessage = '';
  paymentsFilterState = false;
  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;
  tableActionBtns = AccountsTableActionBtns;
  tableColumns: TableColumn[] = AccountsTableColumnsHeaders;
  accounts = signal<AccountsDto[]>([])
  accountTabs = signal<string[]>(['Все', 'Сумовые', 'Валютные'])
  activeAccounts = signal<number>(0)
  navs = signal([
    {
      title: 'Главная',
      link: '/main'
    },
    {
      title: 'Счета ',
      link: '/accounts-and-payments?tab=accounts'
    },
  ]);
  tabs = [
    {
      title: 'Счета',
      value: 'accounts',
    },
    {
      title: 'Платежи',
      value: 'payments',
    }
  ];

  constructor(
    private accountService: AccountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private matDialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private templateService: TemplateService,
    private amountService: AmountService,
    private transactionService: TransactionService,
  ) {
  }

  filter!: any;

  ngOnInit() {
    this.getAccountList()
  }
  onTabClick(index: number) {
    this.activeAccounts.set(index);
    this.getAccountList();
  }

  getAccountList() {
    this.isLoading.set(true);

    this.accountService.getAccountListV2({ size: 100, page: 0 }, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false);
        if (!res) return;

        let accounts = res.content;
        const activeTab = this.activeAccounts();

        if (activeTab === 1) { // Сумовые
          accounts = accounts.filter(acc => acc.saldo?.currency === 'UZS');
        } else if (activeTab === 2) { // Валютные
          accounts = accounts.filter(acc => acc.saldo?.currency !== 'UZS');
        }

        this.accounts.set(accounts);
      });
  }
  onSelectedRows(event: any) {
    this.selectedRows = event;
    // this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  onActionClick(id: any) {
    if (id === 'delete-account') {
      const accountNumber = this.selectedRows.map(el => el.altAcctId);
      this.deleteAccount(accountNumber);
    } else if (id === 'print-account') {
      this.printAccountPdf();
    } else if (id === 'print-transaction') {
      this.printTransactionPdf();
    } else if (id === 'excel-transaction') {
      this.exportTransactionExcel();
    } else if (id === 'excel-account') {
      this.exportAccountToExcel();
    } else if (id === 'delete-transaction') {

    }
  }

  async printAccountPdf() {
    const data = this.selectedRows.map((el: any) => {
      el.currency = el.balance.currency;
      el.statusTranslate = getStatusApplication(el.status).label;
      el.amount = `${this.amountService.convertToAmount(el.balance.amount)}`;
      return el;
    });
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/accounts.mustache',
      templateData: data,
      templateName: 'Счета'
    };
    await this.templateService.showPdfInDialog(options, 'landscape');
  }

  async printTransactionPdf() {
    const data = this.selectedRows.map((el: any) => {
      el.currency = el.senderAmount.currency;
      el.statusTranslate = getStatusApplication(el.status).label;
      el.date = new Date(el.docDate).toLocaleDateString('ru-Ru', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
      const rest = `${(el.balance?.amount || 0) % 100}`.padStart(2, '0');
      el.amount = `${this.amountService.separateNumberByThree(el.senderAmount.amount)},${rest}`;
      return el;
    });
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/transactions.mustache',
      templateData: data,
      templateName: 'Транзакции'
    };
    await this.templateService.showPdfInDialog(options, 'landscape');
  }

  exportTransactionExcel() {
    this.transactionService.exportToExcel(this.selectedRows);
  }

  exportAccountToExcel() {
    this.accountService.exportToExcel(this.selectedRows);
  }

  toggleForAnyElement() {
    if (this.selectedRows?.length) {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'print-account' || el.id === 'excel-account';
        const isTrans = el.id === 'print-transaction' || el.id === 'excel-transaction';
        const isDelete = el.id === 'delete-account' || el.id === 'delete-transaction';
        if (isAccount || isTrans || isDelete) {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'excel-account' || el.id === 'print-account';
        const isTrans = el.id === 'excel-transaction' || el.id === 'print-transaction';
        const isDelete = el.id === 'delete-account' || el.id === 'delete-transaction';
        if (isAccount || isTrans || isDelete) {
          el.active = false;
        }
      })
    }
  }



  getInfo(data: {id: string, codeFilial: string, account: string}) {
    this.utilsService.spinnerState$$.next(true);
    this.accountService.getAccountInfoV2({account:data.account,id:data.id,codeFilial:data.codeFilial}).pipe()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (!res) return
      this.matDialog.open(AccountsPaymentsDetailsComponent, {
        data: {...res},
        width: '400px',
        height: 'calc(100% - 16px)',
        position: {
          right: '0',
        },
        panelClass: 'right-side-dialog',
      })
    })
  }



  deleteAccount(accountNumber: string[]) {
    this.matDialog.open(DeleteAccountComponent, {
      width: '720px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {accountNumber}
    })
  }
}
