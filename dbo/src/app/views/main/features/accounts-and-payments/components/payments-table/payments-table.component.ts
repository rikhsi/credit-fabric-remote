import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { FilterPaymentComponent } from '../../../../../../shared/components/filter-payment/filter-payment.component';
import { AccountsTableActionBtns, PaymentsTableActionBtns } from '../../constants/table-btns';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { TableActionsComponent } from '../../../../../../shared/components/table-actions/table-actions.component';
import { AccountsTableColumnsHeaders, PaymentsTableColumnsHeaders } from '../../constants/table-columns';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { getStatusApplication } from '../../../../../../core/utils/mixin.utils';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { AmountService } from '../../../../../../core/services/amount.service';
import { TransactionService } from '../../../../../../core/services/transaction.service';
import { TransactionDetailComponent } from '../../../transaction-detail/transaction-detail.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-payments-table',
    imports: [
        FilterPaymentComponent,
        FilterButtonComponent,
        TableActionsComponent,
        ContainerTableComponent,
        PaginatorComponent
    ],
    templateUrl: './payments-table.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsTableComponent implements OnInit {
  filter!: any;
  filterState = false;

  selectedRows: any[] = [];

  tableData!: any;
  loading = false;
  errorMessage = '';

  pageIndex = 0;
  pageSize = 20;
  totalItems = 0;

  tableActionBtns = PaymentsTableActionBtns;
  tableColumns = PaymentsTableColumnsHeaders;

  constructor(
    private _cdRef: ChangeDetectorRef,
    private paymentsService: PaymentService,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private amountService: AmountService,
    private templateService: TemplateService,
    private transactionService: TransactionService,
    private matDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getPayments();
  }

  setFilter(value: any, type = 'accounts') {
    this.filter = value;
  }

  getPayments() {
    this.loading = true;
    this.paymentsService.getTransactionList(
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

  getPaymentDetails(row: any) {
    this.matDialog.open(TransactionDetailComponent, {
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: row,
    });
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  toggleForAnyElement() {
    if(this.selectedRows?.length) {
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
    if(this.selectedRows?.length === 1) {
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
    if (id === 'print-transaction') {
      this.printTransactionPdf();
    } else if (id === 'excel-transaction') {
      this.exportTransactionExcel();
    } else if (id === 'delete-transaction') {
      const status = this.selectedRows[0].status;
      if(status !== 'PREPARE') {
        this.toastrService.error('Вы можете удалить только созданную транзакцию!');
        return;
      }
      this.paymentsService.deletePreparedTransaction(this.selectedRows[0].id)
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
  }

  exportTransactionExcel() {
    this.transactionService.exportToExcel(this.selectedRows);
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

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getPayments();
  }
}
