import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { FilterPaymentComponent } from '../../../../../../shared/components/filter-payment/filter-payment.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { TableActionsComponent } from '../../../../../../shared/components/table-actions/table-actions.component';
import { AccountsTableActionBtns } from '../../constants/table-btns';
import { AccountsTableColumnsHeaders } from '../../constants/table-columns';
import { ToastrService } from 'ngx-toastr';
import { AmountService } from '../../../../../../core/services/amount.service';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getStatusApplication } from '../../../../../../core/utils/mixin.utils';
import { AccountService } from '../../../../../../core/services/account.service';
import { DeleteAccountComponent } from '../../../accounts-payments/components/delete-account/delete-account.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-accounts-table',
    imports: [
        ContainerTableComponent,
        FilterButtonComponent,
        FilterPaymentComponent,
        PaginatorComponent,
        TableActionsComponent
    ],
    templateUrl: './accounts-table.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsTableComponent implements OnInit {
  filter!: any;
  filterState = false;

  selectedRows: any[] = [];

  tableData!: any;
  loading = false;
  errorMessage = '';

  pageIndex = 0;
  pageSize = 20;
  totalItems = 0;

  tableActionBtns = AccountsTableActionBtns;
  tableColumns = AccountsTableColumnsHeaders;

  constructor(
    private _cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private amountService: AmountService,
    private templateService: TemplateService,
    private accountService: AccountService,
    private matDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getAccounts();
  }

  setFilter(value: any, type = 'accounts') {
    this.filter = value;
  }

  getAccounts() {
    this.loading = true;
    this.accountService.getAccountListForTable({ page: this.pageIndex, size: this.pageSize }, this.filter)
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

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  toggleForAnyElement() {
    if(this.selectedRows.length) {
      this.tableActionBtns.forEach(el => {
        const isTrans = el.id === 'print-transaction' || el.id === 'excel-transaction';
        if(isTrans) {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        const isTrans = el.id === 'excel-transaction' || el.id === 'print-transaction';
        if(isTrans) {
          el.active = false;
        }
      })
    }
  }

  toggleForOneElement() {
    if(this.selectedRows.length === 1) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete-transaction') {
          el.active = true;
        }
      })
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete-transaction') {
          el.active = false;
        }
      })
    }
  }

  onActionClick(id: any) {
    if(id === 'delete-account') {
      const accountNumber = this.selectedRows[0].altAcctId;
      this.deleteAccount(accountNumber);
    } else if (id === 'print-account') {
      this.printAccountPdf();
    } else if (id === 'excel-account') {
      this.exportAccountToExcel();
    }
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

  exportAccountToExcel() {
    this.accountService.exportToExcel(this.selectedRows);
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

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getAccounts();
  }
}
