import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ContainerTableComponent
} from '../../../../shared/components/common/container-table/container-table.component';
import { FilterAccountComponent } from '../accounts-and-payments/components/filter-account/filter-account.component';
import { FilterButtonComponent } from '../../../../shared/components/common/filter-button/filter-button.component';
import { FilterPaymentComponent } from '../../../../shared/components/filter-payment/filter-payment.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NgOptimizedImage } from '@angular/common';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TableActionsComponent } from '../../../../shared/components/table-actions/table-actions.component';
import { AccountsDto, TransactionContent } from '../accounts-payments/models/accounts-payments.model';
import { AccountsTableActionBtns, PaymentsTableActionBtns } from '../accounts-and-payments/constants/table-btns';
import { TableColumn } from '../../../../shared/interfaces/table.interface';
import {
  AccountsTableColumnsHeaders,
  PaymentsTableColumnsHeaders
} from '../accounts-and-payments/constants/table-columns';
import { AccountService } from '../../../../core/services/account.service';
import { AccountsPaymentsService } from '../accounts-payments/services/accounts-payments.service';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from '../../../../core/services/utils.service';
import { EspSignConfirmService } from '../../../../core/services/esp-confirm.service';
import { ToastrService } from 'ngx-toastr';
import { Options, TemplateService } from '../../../../core/services/template.service';
import { AmountService } from '../../../../core/services/amount.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgreeModalComponent } from '../../../../shared/components/agree-modal/agree-modal.component';
import { getStatusApplication } from '../../../../core/utils/mixin.utils';
import {
  AccountsPaymentsDetailsComponent
} from '../accounts-payments/components/accounts-payments-details/accounts-payments-details.component';
import { TransactionDetailComponent } from '../transaction-detail/transaction-detail.component';
import { DeleteAccountComponent } from '../accounts-payments/components/delete-account/delete-account.component';

@Component({
    selector: 'app-guarantees',
    imports: [
        ContainerTableComponent,
        FilterAccountComponent,
        FilterButtonComponent,
        FilterPaymentComponent,
        MatMenu,
        NgOptimizedImage,
        PaginatorComponent,
        RouterLinkActive,
        TableActionsComponent,
        RouterLink,
        MatMenuTrigger
    ],
    templateUrl: './guarantees.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuaranteesComponent implements OnInit {
  @ViewChild('actionButtons') actionTemplate!: TemplateRef<any>;
  tableData: AccountsDto[] | TransactionContent[] = [];
  selectedRows: any[] =[];
  loading = false;
  errorMessage = '';

  paymentsFilterState = false;

  selectedTab = '';

  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;
  tableActionBtns = AccountsTableActionBtns;
  tableColumns: TableColumn[] = AccountsTableColumnsHeaders;

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
    private espConfirmService: EspSignConfirmService,
    private toastrService: ToastrService,
    private templateService: TemplateService,
    private amountService: AmountService,
    private transactionService: TransactionService,
  ) {
  }

  filter!: any;

  ngOnInit() {
    this.watchTransactionEsp();
    this.getAccounts();
  }

  setFilter(value: any, type = 'accounts') {
    this.filter = value;
  }

  watchTransactionEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res === 'update') {
            this.getPayments();
          }
        }
      })
  }

  getPayments() {
    this.loading = true;
    this._cdRef.detectChanges();
    this.accountsPaymentsService.getTransactionList(
      { page: this.pageIndex, size: this.pageSize },
      this.filter,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.totalItems = res.totalElements;
            this.pageSize = res.pageable.pageSize;
            this.pageIndex = res.pageable.pageNumber;
            this.tableData = res.content;
            this.errorMessage = '';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err;
          if(typeof err === 'object') {
            this.errorMessage = err.message;
          }
          this.tableData = [];
          this._cdRef.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this._cdRef.detectChanges();
        }
      })
  }

  getAccounts() {
    this.loading = true;
    this.accountService.getAccountListForTable({ page: this.pageIndex, size: this.pageSize }, {
      ...this.filter,
      accountPrefixes: ['GUARANTEE_TEMP_ACCOUNT']
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.pageSize = res.size;
            this.pageIndex = res.number;
            this.totalItems = res.totalElements;
            this.tableData = res.content;
            this.errorMessage = '';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err;
          this.tableData = [];
          this._cdRef.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this._cdRef.detectChanges();
        }
      })
  }

  onRowClick(row: any) {
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  onActionClick(id: any) {
    if(id === 'delete-account') {
      const accountNumber = this.selectedRows[0].altAcctId;
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
      this.matDialog.open(AgreeModalComponent, {
        data: {
          title: 'Вы действительно хотите удалить платёж?',
          agree: 'Да',
          cancel: 'Нет',
        }
      }).afterClosed()
        .subscribe({
          next: (res) => {
            if(res === 'agree') {
              this.deleteTransaction();
            }
          }
        })
    }
  }

  deleteTransaction() {
    const status = this.selectedRows[0].status;
    if(status !== 'PREPARE') {
      this.toastrService.error('Вы можете удалить только созданную транзакцию!');
      return;
    }
    this.loading = true;
    this._cdRef.markForCheck();
    this.accountsPaymentsService.deletePreparedTransaction(this.selectedRows[0].id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.toastrService.success('Транзакция успешно удалена!');
            this.getPayments();
          }
        }
      })
  }

  async printAccountPdf() {
    const data = this.selectedRows.map((el: any) => {
      el.currency = el.balance.currency;
      el.statusTranslate = getStatusApplication(el.status).label;
      const rest = `${(el.balance?.amount || 0)%100}`.padStart(2, '0');
      el.amount = `${this.amountService.separateNumberByThree(el.balance.amount)},${rest}`;
      return el;
    });
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/accounts.mustache',
      templateData: data,
      templateName: 'Счета'
    };
    await this.templateService.showPdfInDialog(options);
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
      const rest = `${(el.balance?.amount || 0)%100}`.padStart(2, '0');
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
    await this.templateService.showPdfInDialog(options);
  }

  exportTransactionExcel() {
    this.transactionService.exportToExcel(this.selectedRows);
  }

  exportAccountToExcel() {
    this.accountService.exportToExcel(this.selectedRows);
  }

  toggleForAnyElement() {
    if(this.selectedRows?.length) {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'print-account' || el.id === 'excel-account';
        const isTrans = el.id === 'print-transaction' || el.id === 'excel-transaction';
        if(isAccount || isTrans) {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'excel-account' || el.id === 'print-account';
        const isTrans = el.id === 'excel-transaction' || el.id === 'print-transaction';
        if(isAccount || isTrans) {
          el.active = false;
        }
      })
    }
  }

  toggleForOneElement() {
    if(this.selectedRows?.length === 1) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete-account' || el.id === 'delete-transaction') {
          el.active = true;
        }
      })
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete-account' || el.id === 'delete-transaction') {
          el.active = false;
        }
      })
    }
  }

  getInfo(acc: AccountsDto) {
    this.utilsService.spinnerState$$.next(true);
    this.accountService.getAccountInfo(acc.altAcctId)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (!res) return
      this.matDialog.open(AccountsPaymentsDetailsComponent, {
        data: { ...acc, ...res},
        width: '400px',
        height: '100%',
        position: {right: '0'},
        panelClass: 'right-side-dialog',
      })
    })
  }

  getPaymentDetails(row: any) {
    this.matDialog.open(TransactionDetailComponent, {
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: row,
    }).afterClosed()
      .subscribe({
        next: (res) => {
          if(res === 'update') {
            this.getPayments();
          }
        }
      });
  }

  deleteAccount(accountNumber: string) {
    this.matDialog.open(DeleteAccountComponent, {
      width: '720px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: { accountNumber }
    })
  }

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getAccounts();
  }
}
