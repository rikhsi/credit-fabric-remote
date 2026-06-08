import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
    ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {PaginatorComponent} from "../../../../../../shared/components/paginator/paginator.component";
import {TableActionsComponent} from "../../../../../../shared/components/table-actions/table-actions.component";
import {TransactionContent} from "../../../accounts-payments/models/accounts-payments.model";
import {TableButton} from "../../../../../../shared/interfaces/table-button.interface";
import {rosterTableButton} from "../../../payroll-project/constants/table-btn";
import {TableColumn} from "../../../../../../shared/interfaces/table.interface";
import {formatMonth, RosterTableColumnsHeaders} from "../../../payroll-project/constants/table-columns";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
    PayrollProjectEmployeesCardFilterComponent
} from "../../../../../../shared/components/payroll-project-employees-card-filter/payroll-project-employees-card-filter.component";
import {
  RosterDetailDialogComponent
} from "../../../payroll-project/components/roster/roster-detail-dialog/roster-detail-dialog.component";

@Component({
    selector: 'app-corp-roster',
    imports: [
        ContainerTableComponent,
        FilterButtonComponent,
        PaginatorComponent,
        TableActionsComponent,
        PayrollProjectEmployeesCardFilterComponent
    ],
    templateUrl: './corp-roster.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpRosterComponent implements OnInit{
  filter = signal<any>('')
  filterState = signal(false)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  transactions = signal<TransactionContent[]>([])
  errorMessage = signal<string>('')
  tableActionBtns = signal<TableButton[]>(rosterTableButton)
  tableColumns = signal<TableColumn[]>(RosterTableColumnsHeaders)
  totalItems = signal<number>(0)
  selectedRows = signal<TransactionContent[]>([])
  #destroy = inject(DestroyRef)
  private _dialog = inject(MatDialog)
  private _router = inject(Router)
  private _toast = inject(ToastrService)
  private _accountsPaymentsService = inject(AccountsPaymentsService)

  ngOnInit() {
    this.getPayments()
  }
  // deleteTransaction() {
  //   const status = this.selectedRows()[0].status;
  //   if(status !== 'PREPARE') {
  //     this._toast.error('Вы можете удалить только созданную транзакцию!');
  //     return;
  //   }
  //   this._accountsPaymentsService.deletePreparedTransaction(this.selectedRows()[0].id)
  //     .pipe(takeUntilDestroyed(this.#destroy))
  //     .subscribe({
  //       next: (res) => {
  //         if(res) {
  //           this._toast.success('Транзакция успешно удалена!');
  //           this.getPayments();
  //         }
  //       }
  //     })
  //   this.selectedRows.set([]);
  //   this.toggleForAnyElement()
  // }

  getPayments() {
    this.isLoading.set(true)
    this._accountsPaymentsService.getTransactionList(
      {
        page: this.pageIndex(),
        size: this.pageSize(),
      },
      {transactionModes:['CORP_CARD_TOP_UP'],endDate:null,startDate:null,statuses:null,...this.filter()}
    )
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (res) {
            this.totalItems.set(res.totalElements)
            this.pageSize.set(res.pageable.pageSize)
            this.pageIndex.set(res.pageable.pageNumber)
            const updatedTransactions = res.content.map(transaction=>{
              const month = formatMonth(transaction.additionalInfo?.month)
              const year = transaction.additionalInfo?.year
              const amount = transaction.isDebit ? transaction.senderAmount.amount : transaction.receiverAmount.amount
              const name  = 'Корпоративные карты'
              return {
                ...transaction,
                month,
                year,
                amount,
                name
              }
            })
            this.transactions.set(updatedTransactions)
            this.errorMessage.set('')

          }
        },
        error: (err) => {
          this.isLoading.set(false)
          this.errorMessage.set(err)
          if (typeof err === 'object') {
            this.errorMessage.set(err.message)
          }
          this.transactions.set([])
        },
        complete: () => {
          this.isLoading.set(false)
        }
      })
  }

  navigateToInside(event: TransactionContent) {
    if (event) {
      this._router.navigate(['/corp-card-project/roster/cards',event.docNum])
    }
  }


  onSelectedRows(rows: TransactionContent[]) {
    this.selectedRows.set(rows)
    this.toggleForAnyElement()
    this.tableActionBtns.set([...this.tableActionBtns()])
  }

  toggleForAnyElement() {
    if (this.selectedRows().length) {
      this.tableActionBtns().forEach(el => {
        el.active = true;
      });
    } else {
      this.tableActionBtns().forEach(el => {
        el.active = false;
      })
    }
  }
  getPaymentDetails(row: TransactionContent) {
    this._dialog.open(RosterDetailDialogComponent, {
      width: '550px',
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
  // onActionClick(id: string) {
  //   switch (id) {
  //     case 'delete-roster':
  //       return this.deleteTransaction()
  //   }
  //   return
  // }


  pageChange(value: any) {
    this.pageIndex.set(+value?.page)
    this.pageSize.set(+value?.size)
    this.getPayments();
  }

  setFilter(filter:any){
    this.filter.set(filter)
    this.pageIndex.set(0)
    this.getPayments()
  }
  refreshFilter(reset:any){
    this.filter.set(reset)
    this.pageIndex.set(0)
    this.getPayments()
  }
}
