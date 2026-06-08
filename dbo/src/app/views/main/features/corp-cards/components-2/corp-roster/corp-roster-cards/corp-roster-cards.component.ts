import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
    ContainerTableComponent
} from "../../../../../../../shared/components/common/container-table/container-table.component";
import {
    ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import {
    FilterButtonComponent
} from "../../../../../../../shared/components/common/filter-button/filter-button.component";
import {PaginatorComponent} from "../../../../../../../shared/components/paginator/paginator.component";
import {TableActionsComponent} from "../../../../../../../shared/components/table-actions/table-actions.component";
import {TransactionContent} from "../../../../accounts-payments/models/accounts-payments.model";
import {TableButton} from "../../../../../../../shared/interfaces/table-button.interface";
import {rosterCardTableButton} from "../../../../payroll-project/constants/table-btn";
import {TableColumn} from "../../../../../../../shared/interfaces/table.interface";
import {RosterCardsTableColumnsHeaders} from "../../../../payroll-project/constants/table-columns";
import {SalaryProjectService} from "../../../../../../../core/services/salary-project.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TemplateService} from "../../../../../../../core/services/template.service";
import {TransactionService} from "../../../../../../../core/services/transaction.service";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {AccountsPaymentsService} from "../../../../accounts-payments/services/accounts-payments.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TransactionDetailComponent} from "../../../../transaction-detail/transaction-detail.component";

@Component({
    selector: 'app-corp-roster-cards',
    imports: [
        ContainerNavComponent,
        ContainerTableComponent,
        ContainerTitleComponent,
        FilterButtonComponent,
        PaginatorComponent,
        TableActionsComponent
    ],
    templateUrl: './corp-roster-cards.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpRosterCardsComponent implements OnInit{
  navs = signal(
    [
      {
        title: 'Главная',
        link: '/'
      },

      {
        title: 'Корпоративные карты',
        link: '/corp-card-project/corp-cards'
      },
      {
        title: 'Ведомости',
        link: '/corp-card-project/corp-roster'
      },
      {
        title: 'Карты Реестра',
        link: '/'
      },

    ])
  docNum = signal('')
  parentId = signal<number | undefined>(0)
  filterState = signal(false)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  transactions = signal<TransactionContent[]>([])
  errorMessage = signal<string>('')
  tableActionBtns = signal<TableButton[]>(rosterCardTableButton)
  tableColumns = signal<TableColumn[]>(RosterCardsTableColumnsHeaders)
  totalItems = signal<number>(0)
  selectedRows = signal<TransactionContent[]>([])
  #destroy = inject(DestroyRef)
  private _salaryService = inject(SalaryProjectService)
  private _router = inject(Router)
  private _templateService = inject(TemplateService)
  private _transactionService = inject(TransactionService)
  private _utilsService = inject(UtilsService)
  private _toast = inject(ToastrService)
  private _dialog = inject(MatDialog)
  private _accountsPaymentsService = inject(AccountsPaymentsService)
  private _activatedRoute = inject(ActivatedRoute)

  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      if (params){
        this.docNum.set(params['doc'])
        this.parentId.set(params['parentId'])
        this.getPayments()
      }
    })
  }

  getPayments() {
    this.isLoading.set(true)
    this._accountsPaymentsService.getTransactionList(
      {
        page: this.pageIndex(),
        size: this.pageSize()
      },
      {transactionModes:['CORP_CARD_TOP_UP_CHILD'],endDate:null,startDate:null,statuses:null,docNum:this.docNum(),parentId:this.parentId()}
    )
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (res) {
            this.totalItems.set(res.totalElements)
            this.pageSize.set(res.pageable.pageSize)
            this.pageIndex.set(res.pageable.pageNumber)
            const updatedTransactions = res.content.map(transaction=>{
              const formatter = new Intl.DateTimeFormat('ru-RU',{month:'long'})
              const date  = new Date(transaction.docDate)
              const month = formatter.format(date)
              const year = date.getFullYear()
              const cardNumberUnmasked = transaction.additionalInfo?.cardNumberUnmasked;
              const formattedCardNumber = this.formatCardNumber(cardNumberUnmasked);
              const amount = transaction.isDebit ? transaction.senderAmount.amount : transaction.receiverAmount.amount
              return {
                ...transaction,
                month,
                year,
                amount,
                formattedCardNumber
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
  formatCardNumber(cardNumber: string | undefined): string {
    if (!cardNumber) {
      return '';
    }
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  pageChange(value: any) {
    this.pageIndex.set(+value?.page)
    this.pageSize.set(+value?.size)
    this.getPayments();
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
  onActionClick(id:string){
    switch (id){
      case 'delete-roster-card':
        return this.deleteTransaction()
    }

  }
  getPaymentDetails(row: any) {
    this._dialog.open(TransactionDetailComponent, {
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
    this.selectedRows.set([])
  }

  deleteTransaction() {
    const status = this.selectedRows()[0].status;
    if(!['PREPARE','NEW'].includes(status)) {
      this._toast.error('Вы можете удалить только созданную транзакцию!');
      return;
    }
    this._accountsPaymentsService.deletePreparedTransaction(this.selectedRows()[0].id)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this._toast.success('Транзакция успешно удалена!');
            this.getPayments();
          }
        }
      })
    this.selectedRows.set([]);
    this.toggleForAnyElement()
  }
}
