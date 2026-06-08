import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef, inject, OnInit, signal,
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChildrenOutletContexts, Router, RouterModule} from "@angular/router";
import {routeAnimation} from "../../../../core/animations/route.animation";
import {DashboardTableColumnsHeaders, Transactions} from "../../../../../assets/constants/purpose.const";
import {AccountsTableActionBtns, PaymentTableActionBtns} from "../accounts-and-payments/constants/table-btns";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TransactionService} from "../../../../core/services/transaction.service";
import {UtilsService} from "../../../../core/services/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {PAYMENT_ACTIONS, PAYMENT_HEADER_TYPES} from "./utils/payment.utils";
import {AccountsPaymentsService} from "../accounts-payments/services/accounts-payments.service";
import { TranslateModule } from "@ngx-translate/core";
import {UserService} from "../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {ToastrService} from "ngx-toastr";
import {PaymentSuccessModalComponent} from "../../../../shared/components/payment-success-modal/payment-success-modal";
import {KartotekaModalComponent} from "./modals/kartoteka-modal/kartoteka-modal.component";

@Component({
  selector: 'app-payment',
  animations: [routeAnimation],
  imports: [CommonModule, RouterModule, TranslateModule, MatTooltip],
  templateUrl: './add-payment.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddPaymentComponent implements OnInit {

  constructor(
    private _contexts: ChildrenOutletContexts,
    private accountsPayments: AccountsPaymentsService,
    private transactionService: TransactionService,
    private toast: ToastrService,
    private destroyRef: DestroyRef,
    private router: Router,
    private utilsService: UtilsService,
    private matDialog: MatDialog,
    private _cdRef: ChangeDetectorRef,
    private userService: UserService,
  ) {
  }

  transactionHistory = signal<any>([])
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  loading = signal<boolean>(false)
  loadingKartoteka = signal<boolean>(false)
  signatureCount = signal<number>(0)
  autoPayCount: number = 0;
  tabs = [
    {
      title: 'Перевести на счёт',
      link: 'transfer-to-account',
      icons: './assets/svg/transfer-to-account.svg',
    },
    {
      title: 'В бюджет',
      link: 'transfer-to-budget',
      icons: './assets/svg/transfer-to-budget.svg',
    },
    {
      title: 'В казначейство',
      link: 'transfer-to-treasure',
      icons: './assets/svg/treasury.svg',
    },
    // {
    //   title: 'Перевести на карту',
    //   link: 'transfer-to-card',
    //   icons: './assets/svg/transfer-to-card.svg',
    // },
  ];

  onActionClick(value: any) {
  }

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }
  filter: any
  getPaymentsSignatureGetCount() {
    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ['PREPARE'],
      isSignable: true
    };

    this.accountsPayments.getTransactionList(
      {
        page: 0,
        size: 1,
      },
      filter
    ).subscribe({
      next: val => {
        if (val) {
          this.signatureCount.set(val.totalElements)
        }
      },
    });
  }

  getTransactionHistory() {
    this.loading.set(true)
    this.transactionService.getTransactionHistory({
      params: {isSigned: null},
      paging: {page: 0, size: 15}
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: any) => {
      this.transactionHistory.set(res.result.data?.content || []);
      this.loading.set(false)
    })
  }

  navigate(type: any) {
    if (this.permissionsToTemplates(type.link)) {
      this.router.navigate([type.link], {queryParams: type.query});
    }
  }
  navigateTransactions(item: any) {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.checkKartoteka(item.mode).pipe().subscribe({
      next: (res) => {
        this.utilsService.spinnerState$$.next(false);
        if (res.hasKartoteka2 && res.data.length === 0) {
          this.openKartotekaModal(res.kartoteka2Details)
        } else if (res.hasKartoteka2 && res.data.some((item: any) => item.amountType === 'NEOTLOJKA') && this.requestPermissions(item.link)) {
          this.router.navigate(['/payment/' + item.link], { queryParams: { isKartoteka: 'kartoteka' } })
        } else if (res.hasKartoteka2 && res.data.some((item: any) => item.amountType === 'BRON') && this.requestPermissions(item.link)) {
          if (item.link !== 'transfer-to-munis') {
            this.router.navigate(['/payment/' + item.link], { queryParams: { isKartoteka: 'kartoteka' } })
          } else {
            this.openKartotekaModal(res.kartoteka2Details)
          }
        } else {
          if (this.requestPermissions(item.link)) {
            this.router.navigate(['/payment/' + item.link])
          }
        }
      },
      error: err => {
        this.utilsService.spinnerState$$.next(false);
        this.toast.error(err.message);
      },
    })
  }

  openKartotekaModal(data: any) {
    this.matDialog.open(KartotekaModalComponent, {
      data: data,
      width: "467px",
      minHeight: "620px"
    });
  }

  ngOnInit(): void {
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }
    this.getTransactionHistory();
    this.getPaymentsSignatureGetCount();
  }

  permissionsToTemplates(types: string): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'TEMPLATES')
    if (types === "/templates" && module) {
      return module.types.includes('READ')
    } else if (types === "/history" || types ==='/payment/mass-payments') {
      return true
    }
    return false
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

  protected readonly DashboardTableColumnsHeaders = DashboardTableColumnsHeaders;
  protected readonly Transactions = Transactions;
  protected readonly tableActionBtns = AccountsTableActionBtns;
  protected readonly PaymentTableAction = PaymentTableActionBtns;
  protected readonly PAYMENT_HEADER_TYPES = PAYMENT_HEADER_TYPES;
  protected readonly PAYMENT_ACTIONS = PAYMENT_ACTIONS;
}

