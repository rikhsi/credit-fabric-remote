import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, signal,} from '@angular/core';
import {TransactionModes} from '../../../auth/constants/transaction-list.const';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TransactionContent} from "../accounts-payments/models/accounts-payments.model";
import {MatDialog} from "@angular/material/dialog";
import {AccountsPaymentsService} from "../accounts-payments/services/accounts-payments.service";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../core/services/utils.service";
import {DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {getStatusApplication} from '../../../../core/utils';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AutopayService} from '../../../../core/services/autopay.service';
import {TemplatesTableColumnsHeaders} from './constants/table-column';
import {TemplateDetailsComponent} from './components/template-details/template-details.component';
import {TemplateTableActionBtns} from './constants/table-btn';
import {PaymentService} from '../../../../core/services/payment.service';
import {autoPayPeriod} from '../create-autopay/constans/auto-pay';
import {TEMPLATES_TABS, TemplatesTabKey} from "./constants/time.constant";
import {DeleteModalComponent} from "../../../../shared/components/delete-modal/delete-modal.component";
import {CreateModalComponent} from "./components/create-modal/create-modal.component";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {PaginationComponent} from "../../../../shared/components/pagination/pagination.component";
import {MatChip, MatChipRemove} from "@angular/material/chips";
import {HistoryModalComponent} from "./components/history-modal/history-modal.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {UserService} from "../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TransactionService} from "../../../../core/services/transaction.service";
import {
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {ThemeService} from "../../../../shared/services/theme.service";
import {TemplateDetailModalComponent} from "../template-details/template-detail.component";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';
import {KartotekaModalComponent} from "../add-payment/modals/kartoteka-modal/kartoteka-modal.component";
import {SoftDeleteModalComponent} from "../../../../shared/components/soft-delete-modal/soft-delete-modal.component";

@Component({
  selector: 'app-templates-transactions',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatMenu,
    MatMenuTrigger,
    NgOptimizedImage,
    RouterLink,
    MatMenuItem,
    NgIf,
    NgForOf,
    NgClass,
    PaginationComponent,
    MatChip,
    MatChipRemove,
    TranslateModule,
    MatTooltip,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatEndDate,
    MatInput,
    MatStartDate,
    SoftDeleteModalComponent,
  ],
  templateUrl: './template-transactions.component.html',
  styles: [
    `
      ::ng-deep .mdc-text-field--outlined {
        border-radius: 20px !important;
      }

      div.menu-actions {
        max-width: none !important;
        border-radius: 12px;
        border: 1px solid #EBEBEB;

        .mat-mdc-menu-content {
          padding: 4px;
          font-family: 'Inter', sans-serif;
        }

        box-shadow: 0 1px 18.1px 0 rgba(10, 13, 20, 0.23), 0 1px 2px 0 rgba(10, 13, 20, 0.03)
      }

      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }
    `
  ],
  styleUrls: ['./template-transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class TemplateTransactionsComponent implements OnInit {
  title = 'createPayment.templates';
  tabs = [
    {
      value: 'PAYMENT_TEMPLATE',
      title: 'Шаблоны',
    },
    {
      value: 'AUTO_PAYMENTS',
      title: 'Автоплатежи',
    },
  ];
  templateTransactionsList: TransactionContent[] = [];
  selectedRows: any[] = [];

  filter!: any;
  loading = false;
  pageSize = DEFAULT_PAGE_SIZE;
  pageIndex = 0;
  totalItems = 0;
  typeOfTransaction: string | null = null;
  startDate: any = null;
  endDate: any = null;
  grouped!: any;
  autoPays: any[] = [];
  searchText = '';
  deletedTemplateId = '';
  inputSubject = new Subject<any>();

  templateFilterState = false;
  errorMessage = '';
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  confirmDialog = signal<boolean>(false);

  templateTransactionFilterForm: FormGroup = new FormGroup({
    name: new FormControl<string | null>(''),
    transactionMode: new FormControl<string | null>(null),
    windowType: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
    isSaved: new FormControl<boolean>(true)
  });

  selectedTab = this.tabs[0];
  tableActionBtns = TemplateTableActionBtns;
  public readonly active = signal<TemplatesTabKey>('sum');

  constructor(
    private _matDialog: MatDialog,
    private _cf: ChangeDetectorRef,
    private _accountsPaymentsService: AccountsPaymentsService,
    private _toastr: ToastrService,
    private userService: UserService,
    private _utilsService: UtilsService,
    private destroyRef: DestroyRef,
    private activatedRoute: ActivatedRoute,
    protected router: Router,
    private transactionService: TransactionService,
    private autopayService: AutopayService,
    private paymentService: PaymentService,
    public theme: ThemeService,
    private analyticsService: FirebaseAnalyticsService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }
    this.watchQueryParams();
    this.getTemplateTransactionList();
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.searchText = val.target.value
        this.getTemplateTransactionList();
      });
  }

  setActive(k: TemplatesTabKey) {
    this.active.set(k);
    this.getTemplateTransactionList();
  }

  showDetails(data: TransactionContent) {
    const dialog = this._matDialog.open(TemplateDetailModalComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: data
    });
    dialog.componentInstance.onDetail.subscribe(()=>{
      dialog.close();
    });
  }


  requestPermissions(moduleName: string): boolean {
    const moduleAccount = this.permissionsList()?.find(item => item.module === 'ACCOUNTS');
    const munisAccount = this.permissionsList()?.find(item => item.module === 'MUNIS');
    const moduleCard = this.permissionsList()?.find(item => item.module === 'CARDS');
    if (moduleName === 'transfer-to-account' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-card' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-corporate-card' && moduleCard) {
      return moduleCard.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-budget' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-treasure' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-munis' && munisAccount) {
      return munisAccount.types.includes('ACTION')
    }
    return false;
  }

  openKartotekaModal(data: any) {
    this._matDialog.open(KartotekaModalComponent, {
      data: data,
      width: "467px",
      minHeight: "620px"
    });
  }



  checkKartotkeka(transaction: any) {
    this._utilsService.spinnerState$$.next(true);
    this.transactionService.checkKartoteka(transaction.transactionMode).subscribe((res: any) => {
      this._utilsService.spinnerState$$.next(false);
      if (res) {

        if (!res.hasKartoteka2) {
          this.navigateToEdit(transaction, 'createFromTemplate');
          return;
        }

        const hasNeotlojka = res.data.some((item: any) => item.amountType === 'NEOTLOJKA');
        const hasBron      = res.data.some((item: any) => item.amountType === 'BRON');
        const isEmpty      = res.data.length === 0;
        const isMunis      = transaction.transactionMode === 'MUNIS';

        if (isEmpty || (hasBron && isMunis)) {
          this.openKartotekaModal(res.kartoteka2Details);
        } else if (hasNeotlojka || (hasBron && !isMunis)) {
          this.navigateToEdit(transaction, 'createFromTemplate');
        }
      } else {
        this._toastr.error();
      }

    });
  }


  formatDocDate(createdAt: string): string {
    const [datePart] = createdAt.split(" ");
    const [year, month, day] = datePart.split("-");

    return `${day}.${month}.${year}`
    // const translateMonths = [
    //   'new.january', 'new.february', 'new.march', 'new.april',
    //   'new.may', 'new.june', 'new.july', 'new.august',
    //   'new.september', 'new.october', 'new.november', 'new.december'
    // ];
    //
    // const translateDaysFull = [
    //   'new.sunday', 'new.monday', 'new.tuesday', 'new.wednesday',
    //   'new.thursday', 'new.friday', 'new.saturday'
    // ];
    //
    // const translateDaysShort = [
    //   'new.sun', 'new.mon', 'new.tue', 'new.wed',
    //   'new.thu', 'new.fri', 'new.sat'
    // ];
    //
    // const date = new Date(parseInt(year), parseInt(month, 10) - 1, parseInt(day, 10));
    // const currentYear = new Date().getFullYear();
    // const isCurrentYear = parseInt(year, 10) === currentYear;
    //
    // const monthName = this.translateService.instant(translateMonths[parseInt(month, 10) - 1]);
    // const dayOfWeek = date.getDay();
    //
    // if (isCurrentYear) {
    //   const dayName = this.translateService.instant(translateDaysFull[dayOfWeek]);
    //   return `${parseInt(day, 10)} ${monthName}, ${dayName}`;
    // } else {
    //   const dayNameShort = this.translateService.instant(translateDaysShort[dayOfWeek]);
    //   return `${parseInt(day, 10)} ${monthName} ${year}, ${dayNameShort}`;
    // }
  }


  getActionsHistory(transactionId: string) {
    this.transactionService.getTransactionsActionHistory(transactionId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this._matDialog.open(HistoryModalComponent, {
            width: '550px',
            position: {right: '0', top: '0'},
            panelClass: 'right-side-dialog',
            data: data.actions
          })
        },
        error: (err) => {
          this._toastr.error(err.message);
        }
      })
  }

  createTemplateModal() {
    if (!this.permissionsToActionsInAccounts() || !this.permissionsToActionsInCards()) {
      return;
    }
    this._matDialog.open(CreateModalComponent, {
      data: this.permissionsList(),
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
    })
  }

  pinTemplate(transactionId: string, isPin: boolean) {
    this._accountsPaymentsService.pinTemplate({
      transactionId: transactionId,
      pin: !isPin,
      pinOrder: null
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.getTemplateTransactionList();
          console.log(res, "res")
        },
        error: (err: any) => {
          const message = err.message || err || 'Что-то пошло не так...';
          this._toastr.error(message);
        }
      })
  }

  navigateToEdit(template, type, isKartoteka?: boolean) {
    const kartotekaParam = isKartoteka ? { isKartoteka: 'kartoteka' } : {};
    if (template.additionalInfo.windowType === 'BUDGET') {
      this.router.navigate(['/payment/transfer-to-budget'], {
        queryParams: {
          type: type,
          templateId: template.id,
          templateName: template.name,
          ...kartotekaParam,
        }
      })
    } else if (template.additionalInfo.windowType === 'BUDGET_INCOME') {
      this.router.navigate(['/payment/transfer-to-treasure'], {
        queryParams: {
          type: type,
          templateId: template.id,
          templateName: template.name,
          ...kartotekaParam,
        }
      })
    } else if (template.additionalInfo.windowType === "ACCOUNT_TO_PHYSICAL_CARD") {
      this.router.navigate(['/payment/transfer-to-card'], {
        queryParams: {
          type: type,
          templateId: template.id,
          templateName: template.name,
          ...kartotekaParam,
        }
      })
    } else if (template.additionalInfo.windowType === "CORPORATE") {
      this.router.navigate(['/payment/transfer-to-corporate-card'], {
        queryParams: {
          type: type,
          templateId: template.id,
          templateName: template.name,
          ...kartotekaParam,
        }
      })
    } else {
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          type: type,
          templateId: template.id,
          templateName: template.name,
          ...kartotekaParam,
        }
      })
    }
  }
  private setStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.normalizeLocalTime(d);
  }

  private setEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return this.normalizeLocalTime(d);
  }

  private normalizeLocalTime(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  onApply() {
    this.getTemplateTransactionList();
  }

  permissionsToActions(): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'TEMPLATES')
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  permissionsToActionsInAccounts(): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'ACCOUNTS')
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  permissionsToActionsInCards(): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'CARDS')
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  onConfirmed() {
    this._accountsPaymentsService.deleteTemplate(this.deletedTemplateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.analyticsService.logFirebaseCustomEvent('delete_template_success', { template_id: this.deletedTemplateId});

          this.confirmDialog.set(false)
          if (res) {
            this._toastr.success('Удаление завершено', 'Шаблон удален');
            this.getTemplateTransactionList();
          }
        },
        error: (err: any) => {
          this.confirmDialog.set(false);
          const message = err.message || err || 'Что-то пошло не так...';
          this._toastr.error(message);
        }
      })
  }

  onCancelled() {
    this.confirmDialog.set(false)
  }

  deleteTemplate(template: any) {
    if (template) {
      this._matDialog.open(DeleteModalComponent, {
        maxWidth: "480px",
        width: "480px",
        data: {
          title: 'Вы действительно хотите удалить шаблон?'
        }
      }).afterClosed()
        .subscribe((res) => {
          if (res) {
            this.deletedTemplateId = template.id
            this.confirmDialog.set(true);
            this._cf.detectChanges();
          }
        })

    }
  }

  detectPeriodLabel(startDate: Date, endDate: Date): string {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const weekEnd = todayEnd;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const format = (d: Date) =>
      d.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'});

    if (startDate.getTime() === todayStart.getTime() && endDate.getTime() === todayEnd.getTime()) {
      return `Сегодня ${format(startDate)}`;
    }

    if (startDate.getTime() === yesterdayStart.getTime() && endDate.getTime() === yesterdayEnd.getTime()) {
      return `Вчера ${format(startDate)}`;
    }

    if (startDate.getTime() === weekStart.getTime() && endDate.getTime() === weekEnd.getTime()) {
      return `${format(weekStart)} – ${format(weekEnd)}`;
    }

    if (startDate.getTime() === monthStart.getTime() && endDate.getTime() === monthEnd.getTime()) {
      return `${format(monthStart)} – ${format(monthEnd)}`;
    }

    return `${format(startDate)} – ${format(endDate)}`;
  }

  setPeriodToday() {
    const today = new Date();
    const startDateN = new Date(today.setHours(0, 0, 0, 0));
    const endDateN = new Date(today.setHours(23, 59, 59, 999));
    this.startDate = startDateN;
    this.endDate = endDateN;
    this._cf.detectChanges();
    return this.getTemplateTransactionList()
  }

  setPeriodYesterday() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startDateN = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endDateM = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    this.startDate = startDateN;
    this.endDate = endDateM;
    this._cf.detectChanges();
    return this.getTemplateTransactionList()
  }

  setPeriodWeek() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    this.startDate = startDate;
    this.endDate = endDate;
    this._cf.detectChanges();
    return this.getTemplateTransactionList()
  }

  setPeriodMonth() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);

    this.startDate = startDate;
    this.endDate = endDate;
    this._cf.detectChanges();
    return this.getTemplateTransactionList()
  }

  getTemplateDetails(row: any) {
    this._matDialog.open(TemplateDetailsComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {transaction: row},
    }).afterClosed()
      .subscribe({
        next: (res) => {
          if (res === 'update') {
            this.getTemplateTransactionList();
          }
        }
      });
  }

  watchQueryParams() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val['tab'] === 'AUTO_PAYMENTS') {
          this.selectedTab = this.tabs[1];
          this.getAutopayList();
        } else if (val['tab'] === 'PAYMENT_TEMPLATE') {
          this.selectedTab = this.tabs[0];
        } else {
          this.router.navigate(['templates'], {
            queryParams: {
              tab: 'PAYMENT_TEMPLATE'
            }
          })
        }
      })
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cf.detectChanges();
  }

  toggleForAnyElement() {
    if (this.selectedRows?.length) {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'print-account' || el.id === 'excel-account';
        const isTrans = el.id === 'print-transaction' || el.id === 'excel-transaction';
        if (isAccount || isTrans) {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        const isAccount = el.id === 'excel-account' || el.id === 'print-account';
        const isTrans = el.id === 'excel-transaction' || el.id === 'print-transaction';
        if (isAccount || isTrans) {
          el.active = false;
        }
      })
    }
  }

  toggleForOneElement() {
    if (this.selectedRows?.length === 1) {
      this.tableActionBtns.forEach(el => {
        if (el.id === 'delete') {
          el.active = true;
        }
      })
    } else {
      this.tableActionBtns.forEach(el => {
        if (el.id === 'delete') {
          el.active = false;
        }
      })
    }
  }

  selectFilterType(type: any) {
    if (type !== 'all') {
      this.typeOfTransaction = type;
      this.getTemplateTransactionList();
    } else {
      this.typeOfTransaction = null;
      this.getTemplateTransactionList();
    }
  }


  getTemplateTransactionList() {
    this.loading = true
    this.templateTransactionsList = [];
    const body = this.templateTransactionFilterForm.getRawValue();
    body.statuses = ['SAVED'];
    body.windowType = this.typeOfTransaction !== null ? [this.typeOfTransaction] : null;
    body.name = this.searchText;
    if (this.active() !== 'all') {
      body.foreignCurrency = this.active() !== 'sum';
    }
    delete body.status;
    delete body.transactionMode;
    delete body.isSaved;
    this._accountsPaymentsService
      .getTransactionList({
        page: this.pageIndex,
        size: this.pageSize,
      }, {
        ...this.filter,
        ...body,
        startDate: this.startDate ? this.setStartOfDay(this.startDate) : null,
        endDate: this.endDate  ? this.setEndOfDay(this.endDate) : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res) {
            return
          }
          this.loading = false
          this.totalItems = res.totalElements;
          this.pageSize = res.pageable.pageSize;
          this.pageIndex = res.pageable.pageNumber;

          this.templateTransactionsList = res.content;
          this._cf.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err || err.message || 'Что то пошло не так...';
          this.loading = false;
          this._cf.detectChanges();
        }
      })
  }

  pageChange(value: any) {
    console.log(value, "r")
    this.pageIndex = +value;
    this.getTemplateTransactionList();
  }

  sizeChange(value: any) {
    this.pageIndex = 0;
    this.pageSize = +value;
    this.getTemplateTransactionList();
  }

  setFilter(filter: any) {
    this.filter = filter;
    this.getTemplateTransactionList();
  }


  getAutopayList() {
    this.loading = true;
    this.autopayService.getAutoPayList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: val => {
          if (val) {
            this.autoPays = val;
            this.autoPays.forEach((el) => {
              const paymentFrequency = autoPayPeriod.find(a => {
                return a.value === el.paymentFrequency;
              });
              el.paymentFrequencyTitle = paymentFrequency?.title || 'Неизвестно';
            });
            this.loading = false;
            this.errorMessage = '';
            this._cf.detectChanges();
          }
        },
        error: (err: any) => {
          this.errorMessage = err.message || err || 'Что то пошло не так...';
          this.loading = false;
          this._cf.detectChanges();
        }
      })
  }

  openAutoPayDetails(row: any) {
    console.log(row)
    this._matDialog.open(TemplateDetailsComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {transaction: row.transaction, autoPay: row},
    }).afterClosed().subscribe((message) => {
      if (message === 'update') {
        this.getAutopayList();
      }
    });
  }

  protected readonly getStatusApplication = getStatusApplication;
  protected readonly transactionModes = TransactionModes;
  protected readonly tableColumns = TemplatesTableColumnsHeaders;
  protected readonly TEMPLATES_TABS = TEMPLATES_TABS;
  protected readonly Math = Math;
  protected readonly console = console;
}
