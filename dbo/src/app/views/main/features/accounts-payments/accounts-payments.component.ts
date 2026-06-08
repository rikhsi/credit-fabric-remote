import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  OnDestroy,
  OnInit, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatOption, MatRipple} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NgxMaskPipe} from 'ngx-mask';
import {ToastrService} from 'ngx-toastr';
import {Subject, take, takeUntil} from 'rxjs';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {UtilsService} from 'src/app/core/services/utils.service';
import {
  AccountsPaymentsDetailsComponent,
} from './components/accounts-payments-details/accounts-payments-details.component';
import {AccountsDto, TransactionContent} from './models/accounts-payments.model';
import {AccountsPaymentsService} from './services/accounts-payments.service';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {TransactionMode, TransactionStatus} from "../../../auth/constants/transaction-list.const";
import { DatePipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import {MatTooltip} from "@angular/material/tooltip";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {SaveTransactionComponent} from "./components/save-transaction/save-transaction.component";
import {EspSignConfirmService} from "../../../../core/services/esp-confirm.service";
import {EspSignConfirmComponent} from "../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {ApplicationsService} from "../applications/services/applications.service";
import {ApplicationItem} from "../applications/models/applications.model";
import {ApplicationViewComponent} from "../applications/components/application-view/application-view.component";
import {TransactionService} from '../../../../core/services/transaction.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {DeleteAccountComponent} from './components/delete-account/delete-account.component';
import {TransactionDetailComponent} from "../transaction-detail/transaction-detail.component";
import { getTransactionTypeTranslation } from '../../../../core/models/transaction.models';
import { AccountService } from '../../../../core/services/account.service';


@Component({
    selector: 'app-accounts-payments',
    imports: [
        MatTab,
        MatTabGroup,
        MatButton,
        MatIcon,
        UiSvgIconComponent,
        MatRipple,
        RouterModule,
        MatCheckbox,
        FormsModule,
        MatDatepickerModule,
        MatInputModule,
        NgxMaskPipe,
        MatSelect,
        MatOption,
        ReactiveFormsModule,
        MatMenu,
        MatMenuTrigger,
        MatTooltip,
        MatPaginator,
        DatePipe,
        ApplicationViewComponent,
        NgIf,
        NgClass,
        NgOptimizedImage
    ],
    templateUrl: './accounts-payments.component.html',
    styles: `
    .inner-tab {
      .mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
      .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
        color: #000;
      }

      .mat-mdc-tab.mdc-tab {
        height: 35px;
      }

      .mat-mdc-tab .mdc-tab-indicator__content--underline {
        border: 2px solid #007aff !important;
      }

      .payment-mat-date,
      .payment-select {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #dbdbdb !important;
        }

        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 10px !important;
        }

        .mat-mdc-select-arrow {
          display: none;
        }

        .mat-mdc-form-field-flex {
          height: 44px;
          padding: 8px;
        }

        .mat-mdc-form-field-infix {
          padding-top: 16px;
          top: -15px;
        }

        .mat-mdc-select-placeholder,
        .mat-mdc-form-field-input-control,
        .mat-mdc-select-value-text {
          color: #000;
        }

        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }

        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
      }

      .payment-currency-select {
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }

        padding-left: 25px;
        font-size: 14px;
      }

      .salary-table {
        tr {
          height: 64px
        }

        th:not(:first-child), td:not(:first-child) {
          padding-right: 15px;
        }
      }
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DatePipe],
    animations: [
        trigger("inOutPaneAnimation", [
            transition(":enter", [
                style({ opacity: 0, transform: "translateX(100%)" }),
                animate("500ms ease-in-out", style({ opacity: 1, transform: "translateX(0)" }))
            ]),
            transition(":leave", [
                style({ opacity: 1, transform: "translateX(0)" }),
                animate("300ms ease-in-out", style({ opacity: 0, transform: "translateX(100%)" }))
            ])
        ])
    ]
})
export class AccountsPaymentsComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsub$ = new Subject<void>();
  isFetching: boolean = false
  isFilter = false;
  accountsList: AccountsDto[] = [];
  transactionsList: TransactionContent[] = [];
  pageIndex = 0;
  pageIndex1 = 0;
  pageSize1 = 20;
  pageSize = 20;
  applicationType = 'CREATE_ACCOUNT';

  applicationTypes = [
    {
      title: 'Открытие',
      value: 'CREATE_ACCOUNT'
    },
    {
      title: 'Закрытие',
      value: 'CLOSE_ACCOUNT'
    }
  ]
  form = this._fb.nonNullable.group({
    id: [null as unknown as string, Validators.required],
  });
  transactionFilterForm: FormGroup = new FormGroup({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    transactionModes: new FormControl<string | null>(null),
    statuses: new FormControl<string | null>(null),
  })
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('rl') tabGroup!: MatTabGroup;
  transactionCount = 20;

  constructor(
    private _matDialog: MatDialog,
    private _cf: ChangeDetectorRef,
    private _accountsPaymentsService: AccountsPaymentsService,
    private _accountService: AccountService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
    private _utilsService: UtilsService,
    private datePipe: DatePipe,
    private espSignService: EspSignConfirmService,
    private transactionService: TransactionService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
  }

  private _applicationService = inject(ApplicationsService)
  protected readonly TransactionStatus = TransactionStatus;
  protected readonly TransactionMode = TransactionMode;
  accountApplications: ApplicationItem[] = []
  downloadOptions = [
    {
      title: 'Письмо с информацией по счетам',
      id: 'INFORMATION_ABOUT_ACCOUNTS_BALANCES_K2'
    },
    {
      title: 'Письмо с информацией по Картотеке - 2',
      id: 'INFORMATION_ABOUT_CARD_INDEX_2'
    },
    {
      title: 'Письмо с информацией по Картотекам - 1,2, арестах на счетах.',
      id: 'INFORMATION_ABOUT_CARD_INDEXES_1_2_ARRESTS_ON_ACCOUNTS'
    },
    {
      title: 'Письмо с информацией об открытых счетах в филиале банка',
      id: 'INFORMATION_ABOUT_OPEN_ACCOUNTS_IN_BANK_BRANCH'
    },
    {
      title: 'Письмо с информацией по счетам (остатки, обороты, К2)',
      id: 'INFORMATION_ABOUT_ACCOUNTS_BALANCES_TURNOVERS_K2'
    },
  ]

  ngOnInit(): void {
    this.getInitialDate();
    this.getListOfAccount();
    this.getTransactionListHistory();
    this.getApplicationsList();
    this.getRangeFromCalendar();
  }

  setTab() {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this.unsub$))
      .subscribe(params => {
        const tab = params['tab'];
        if (tab && this.tabGroup) {
          this.tabGroup.selectedIndex = +Number(tab);
          this._cf.detectChanges();
        }
      })
  }

  onTabChange(e: any) {
    if (this.isFilter) {
      this.isFilter = false;
    }
    const tabIndex = e.index;

    this.router.navigate([], {
      queryParams: {tab: tabIndex},
      queryParamsHandling: 'merge',
    });
  }

  ngAfterViewInit() {
    this.setTab();
  }

  getInitialDate() {
    const startDate = sessionStorage.getItem('transactionHistoryStartDate');

    if (startDate) {
      this.transactionFilterForm.patchValue({
        startDate: startDate,
        endDate: startDate
      })
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('transactionHistoryStartDate');
    this.unsub$.next();
    this.unsub$.complete();
  }

  getRangeFromCalendar() {
    this.transactionService.transactionsHistoryRange
      .pipe(takeUntil(this.unsub$))
      .subscribe(dateRange => {
        this.transactionFilterForm.patchValue({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        this.getTransactionListHistory();
      })
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.onDownloadReference(this.form.controls.id.value);
  }

  getTransactionListHistory(paging = {page: 0, size: 20}) {
    this.transactionsList = [];
    const transactionModes = this.transactionFilterForm.value.transactionModes ? [this.transactionFilterForm.value.transactionModes] : this.transactionFilterForm.value.transactionModes;
    const statuses = this.transactionFilterForm.value.statuses ? [this.transactionFilterForm.value.statuses] : this.transactionFilterForm.value.statuses;
    this._accountsPaymentsService.getTransactionList(paging,
      {
        ...this.transactionFilterForm.value,
        transactionModes,
        statuses
      }).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this.pageSize = paging.size;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.length = res.totalElements;
      this.transactionsList = res.content
      this._cf.detectChanges()
    })
  }

  getInfo(accountNumber: string) {
    this._accountService.getAccountInfo(accountNumber).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this._matDialog.open(AccountsPaymentsDetailsComponent, {
        disableClose: true,
        data: res,
        width: '400px',
        height: '100%',
        position: {right: '0'},
        panelClass: 'right-side-dialog',
      })
    })
  }

  toHistory() {

  }

  deleteAccount(accountNumber: string) {
    this._matDialog.open(DeleteAccountComponent, {
      width: '720px',
      disableClose: true,
      data: {accountNumber}
    })
  }

  addTemplate(id: string) {
    if (id) {
      let dialog = this._matDialog.open(SaveTransactionComponent, {
        disableClose: true,
        data: id
      })
      dialog.componentInstance.save.pipe(takeUntil(this.unsub$)).subscribe(() => {
        dialog.close()
        this.getTransactionListHistory()
      })
    }
  }

  filter() {
    if (this.transactionFilterForm.valid) {
      this.transactionFilterForm.patchValue({
        startDate: this.formatDate(this.transactionFilterForm.value.startDate),
        endDate: this.formatDate(this.transactionFilterForm.value.endDate)
      })
      this.getTransactionListHistory();
    }
  }

  refreshFilter() {
    this.transactionFilterForm.reset()
    this.getTransactionListHistory()
  }

  getListOfAccount(paging = {page: 0, size: 20}) {
    this.isFetching = true
    this.accountsList = []
    this._accountService.getAccountList(paging, {}).pipe(takeUntil(this.unsub$)).subscribe({
      next: (res) => {
        if (res) {
          this.pageSize1 = paging.size;
          this.paginator1.pageIndex = this.pageIndex1;
          this.paginator1.length = res.totalElements;
          this.accountsList = res.content
        }
      },
      complete: () => {
        this.isFetching = false
        this._cf.detectChanges();
      }
    });
  }

  onDownloadReference(arrangementId: string) {
    this._utilsService.spinnerState$$.next(true);
    this._accountsPaymentsService.getReference(arrangementId).subscribe(res => {
      if (!res) return;
      const a = document.createElement('a');
      a.href = res.msg;
      a.click();
      this._toastr.success('Успешно');
    })
    this.form.reset();
  }

  formatDate(date: Date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  pageChanged(event: PageEvent) {
    this._utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getTransactionListHistory({page: page, size: size})
  }

  pageChanged1(event: PageEvent) {
    this._utilsService.spinnerState$$.next(true);
    this.pageIndex1 = event.pageIndex;
    this.pageSize1 = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getListOfAccount({page: page, size: size})
  }

  getFormattedAccount(account: string) {
    if (account) {
      const start = account.slice(0, 5);
      const end = account.slice(-3);
      return `${start}****${end}`
    } else {
      return account
    }
  }

  signSetIds = new Set<string>();
  signArrIds: string[] = [];

  addToSigning(id: string) {
    if (this.signSetIds.has(id)) {
      this.signSetIds.delete(id)
    } else {
      this.signSetIds.add(id)
    }
    this.signArrIds = Array.from(this.signSetIds);
  }

  sign(id: string ) {
    if(!id) {
      return;
    }
    this._utilsService.spinnerState$$.next(true);
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: {action: {externalId: id, type: 'TRANSACTION'}, transaction: {}},
    });
  }

  send(id: string, transactionMode = 'TRANSACTION') {
    this.espSignService.paymentSign({
      type: transactionMode,
      id: id,
      hash: ''
    }).pipe(takeUntil(this.unsub$)).subscribe(() => {
    })
  }

  deletePayment(id: string, absStatus = 'PREPARE') {
    if (id) {
      const dialog = this._matDialog.open(AgreeDialogComponent, {
        data: {title: 'Вы точно хотите удалить'},
      })
      dialog.afterClosed().pipe(takeUntil(this.unsub$)).subscribe((res) => {
        if (res === 'success') this.delete(id, absStatus)
      })
    }
  }


  delete(id: string, absStatus = 'PREPARE') {
    this._utilsService.spinnerState$$.next(true);

    if (absStatus === 'PREPARE' || absStatus === 'ERROR') {
      this._accountsPaymentsService
        .deletePreparedTransaction(id)
        .pipe(takeUntil(this.unsub$))
        .subscribe((res) => {
          if (!res) return
          this._toastr.success(res.msg)
          this.getTransactionListHistory()
        });
    }

    if (absStatus === 'SAVED') {
      this._accountsPaymentsService.deleteSavedPayment(id)
        .pipe(takeUntil(this.unsub$))
        .subscribe((res) => {
          if (!res) return;
          this._toastr.success(res.msg);
          this.getTransactionListHistory();
        })
    }
  }

  setApplicationType() {
    this.getApplicationsList();
  }

  getApplicationsList() {
    this._applicationService.getApplications(
      {
        pageSize: 20,
        pageNum: 0,
        sender: null,
        receiver: null,
        dateFrom: null,
        dateTo: null,
        amountFrom: null,
        amountTo: null,
        docNum: null,
        currency: null,
        searchText: '',
        applicationTypes: ['CONVERSION_CROSS'],
      }
    )
      .pipe(takeUntil(this.unsub$))
      .subscribe((res) => {
      if (!res) return
      // this.accountApplications = res.content;
      this._cf.detectChanges();
    })
  }


  downloadExcelFile() {
    this._accountsPaymentsService
      .getTransactionList({page: 0, size: this.transactionCount}, this.transactionFilterForm.value)
      .pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this.transactionService.exportToExcel(res.content)
    })
  }

  getStatusTranslation(status: string): { translation: string, bgColor: string } {
    switch (status) {
      case 'SAVED':
        return {translation: 'Сохранено', bgColor: 'bg-blue-500'};
      case 'PREPARE':
        return {translation: 'Создано', bgColor: 'bg-yellow-500'};
      case 'PREPARE_DIRECTOR':
        return {translation: ' директором', bgColor: 'bg-yellow-600'};
      case 'PENDING':
        return {translation: 'Ожидание', bgColor: 'bg-orange-500'};
      case 'SUCCESS':
        return {translation: 'Успешно', bgColor: 'bg-green-500'};
      case 'CANCEL':
        return {translation: 'Отменено', bgColor: 'bg-red-500'};
      case 'SIGN':
        return {translation: 'Подписание', bgColor: 'bg-blue-300'};
      case 'ERROR':
        return {translation: 'Ошибка', bgColor: 'bg-red-700'};
      default:
        return {translation: 'Неизвестно', bgColor: 'bg-gray-500'};
    }
  }

  openTransactionDetail(id: string) {
    if (id) {
      this.transactionService.getTransactionDetail(id).pipe(takeUntil(this.unsub$)).subscribe((res) => {
        console.log(res)
        if (res) {
          this._matDialog.open(TransactionDetailComponent, {
            width: '475px',
            height: '100%',
            position: {right: '0'},
            panelClass: 'right-side-dialog',
            data: res
          });
        }
      })
    }
  }

  protected readonly Math = Math;
  protected readonly Number = Number;
  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
}
