import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { BalanceComponent } from "./components/balance/balance.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AccountService } from "../../../../core/services/account.service";
import { Balance } from "../../../../core/models/backend-response.model";
import { MatDialog } from "@angular/material/dialog";
import { WidgetsComponent } from "./components/widgets/widgets.component";
import { AccountsPaymentsService } from "../accounts-payments/services/accounts-payments.service";
import { RightBarService } from "../../right-bar/services/right-bar.service";
import {filter, forkJoin, pairwise} from "rxjs";
import { NgClass, NgForOf } from "@angular/common";
import { AccountsComponent } from "./components/accounts/accounts.component";
import { CardsComponent } from "./components/cards/cards.component";
import { CreditsComponent } from "./components/credits/credits.component";
import { AccountsDto } from "../accounts-payments/models/accounts-payments.model";
import { SalaryProjectService } from "../../../../core/services/salary-project.service";
import { PayrollProjectResponseContent } from "../payroll-project/models/payroll-project.type";
import { DepositsComponent } from "./components/deposits/deposits.component";
import { DepositService } from "../deposits/services/deposit.service";
import { SettingsComponent } from "./components/settings/settings.component";
import { MAIN_COMPONENT_PRODUCTS, TabKey } from "./constants/new-main.const";
import { PaymentsComponent } from "../main/components/payments/payments.component";
import {getTranslate} from "../../../../core/utils/mixin.utils";
import { AccountStore } from "../../../../store/account.store";
import {NavigationEnd, Router} from "@angular/router";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CorpCardService} from "../corp-card-project/services/corp-card.service";
import {LoanService} from "../loans/services/loan.service";
import {Loan} from "../loans/models/loan.model";
import {ToastrService} from "ngx-toastr";
import {ServiceControllerStore} from "../../../../core/components/service-controller-check/service-controller.store";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";




@Component({
  selector: 'app-new-main',
  imports: [
    BalanceComponent,
    NgClass,
    NgForOf,
    AccountsComponent,
    CardsComponent,
    CreditsComponent,
    DepositsComponent,
    TranslateModule,
    PaymentsComponent,
  ],
  templateUrl: './new-main.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewMainComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  readonly accountStore = inject(AccountStore)
  private readonly router = inject(Router)
  private readonly _accountService = inject(AccountService);
  private readonly cardService = inject(SalaryProjectService);
  private readonly depositService = inject(DepositService);
  private readonly accountsAndPaymentService = inject(AccountsPaymentsService);
  private readonly rightBarService = inject(RightBarService);
  private readonly corpCardService = inject(CorpCardService);
  private readonly loanService = inject(LoanService);
  private toastService = inject(ToastrService);
  private serviceStore  = inject(ServiceControllerStore);

  public readonly isLoading = signal(false);
  public readonly balance = signal<Balance | null>(null);
  public readonly accounts = signal<AccountsDto[]>([]);
  public readonly cards = signal<PayrollProjectResponseContent[]>([]);
  public readonly deposits = signal<any[]>([]);
  public readonly credits = signal<Loan[]>([]);
  public readonly active = signal<TabKey>('accounts');
  globalHideBalance = signal<boolean>(false);
  hiddenAccountIds = signal<string[]>([]);
  showAccountIds = signal<string[]>([]);
  refreshTrigger = signal(0);
  currency = signal('');
  totalBalance = signal<Balance | null>(null);
  currencyList = signal<{ code: string; flag: string }[]>([])

  // private readonly MAX_ITEMS = 4;
  constructor(
    private translateService: TranslateService,
    private analyticsService: FirebaseAnalyticsService
  ) {
  }
  ngOnInit(): void {
    this.sendEvent()
    this.serviceStore.setServices([]);
    const savedGlobal = localStorage.getItem('globalHideBalance');
    const savedHidden = localStorage.getItem('hiddenAccountIds');

    if (savedGlobal !== null) this.globalHideBalance.set(savedGlobal === 'true');

    if (savedHidden) {
      try {
        this.hiddenAccountIds.set(JSON.parse(savedHidden));
      } catch (e) {
        this.hiddenAccountIds.set([]);
      }
    }
    this.loadInitialData();
    this.getCurrencyAndAccountResponseTypes();
    this.getTotalBalance(this.active(), 'UZS');
  }
  sendEvent(){
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        pairwise()
      )
      .subscribe(([prev, curr]: any) => {

        const previousUrl = prev?.urlAfterRedirects;
        const currentUrl = curr?.urlAfterRedirects;

        if (previousUrl?.includes('/main') && currentUrl?.includes('/accounts')) {
          this.analyticsService.logFirebaseCustomEvent('accounts_screen_jump', {
           screen:"main"
          });
        } else  if (previousUrl?.includes('/payment') && currentUrl?.includes('/main')) {
          this.analyticsService.logFirebaseCustomEvent('main_screen_jump', {
            screen:"transfers"
          });
        } else  if (previousUrl?.includes('/main') && currentUrl?.includes('/payment')) {
          this.analyticsService.logFirebaseCustomEvent('transfers_screen_jump', {
            screen:"main"
          });
        } else  if (previousUrl?.includes('/main') && currentUrl?.includes('/history')) {
          this.analyticsService.logFirebaseCustomEvent('history_screen_jump', {
            screen:"main"
          });
        } else  if (previousUrl?.includes('/main') && currentUrl?.includes('/payroll-project/statements')) {
          this.analyticsService.logFirebaseCustomEvent('payrolls_screen_jump', {
            screen:"main"
          });
        } else  if (previousUrl?.includes('/main') && currentUrl?.includes('/kartoteka/list/kartoteka-2')) {
          this.analyticsService.logFirebaseCustomEvent('kartoteka2_screen_jump', {
            screen:"main"
          });
        }
      });
  }
  changeCurrency(currency: string) {
    this.currency.set(currency);
    this.getTotalBalance(this.active(), currency)
  }

  getCurrencyListCredit() {
    this.loanService.getTotalBalance('UZS').pipe().subscribe({
      next: result => {
        if (result) {
          const arr: any = [];
          result.currencyListObj.forEach((currency: any) => {
            arr.push({ code: currency.currency, flag: currency.logo.path + currency.logo.name })
          })
          this.currencyList.set(arr)
          // this.totalBalance.set(result.totalBalance)
        }
      },
      error: () => {
        this.toastService.error('Ошибка при получении баланса');
      }
    })
  }

  getTotalBalance(type: 'accounts' | 'deposits' | 'cards' | 'credits', currency?: string) {
    if (type === 'credits') {
      this.loanService.getTotalBalance(currency ?? 'UZS').pipe().subscribe({
        next: result => {
         if (result) {
           this.totalBalance.set(result.totalBalance)
         }
        },
        error: () => {
          this.toastService.error('Ошибка при получении баланса');
        }
      })
    } else if (type === 'cards') {
      this.corpCardService.getCardsTotalBalance(
        { updateBalance: true, type: "UZCARD", status: "ACTIVE",  userType: "CORPORATE" , currency: currency ?? 'UZS' }
      ).pipe().subscribe({
        next: result => {
          if (result) {
            this.totalBalance.set(result.totalAmount)
          }
        }
      })
    } else if (type === 'deposits') {
      this._accountService.getAccountBalance({ currency: currency ?? 'UZS', module: 'DEPOSIT' }).pipe().subscribe({
        next: result => {
          if (result) {
            this.totalBalance.set(result.currentlyAmount)
          }
        }
      })
    } else if (type === 'accounts') {
      this._accountService.getAccountBalance({ currency: currency ?? 'UZS', module: 'ACCOUNT' }).pipe().subscribe({
        next: result => {
          if (result) {
            this.totalBalance.set(result.currentlyAmount)
          }
        }
      })
    }
  }

  private getCurrencyAndAccountResponseTypes() {
    this._accountService.getCurrencyAndAccountResponseTypes().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res) => {
      if (res) {
        this.currencyList.set(res.currencyList.map((v => ({
          code: v.name,
          flag: v.logo.path + v.logo.name
        }))));
      } else {
        this.currencyList.set([])
      }
    });
  }

  toggleGlobalHide() {
    try {
      const newVal = !this.globalHideBalance();
      this.globalHideBalance.set(newVal);
      localStorage.setItem('globalHideBalance', String(newVal));
      localStorage.removeItem('hiddenAccountIds');
      localStorage.removeItem('showAccountIds');
      this.refreshTrigger.update(value => value + 1);
    } catch (e) { }


  }
  refreshAccount() {
    this.loadShowAccountIdsFromStorage()
  }

  toggleAccountVisibility(id: string) {
    if (this.globalHideBalance()) {
      this.loadShowAccountIdsFromStorage()
      const currentShow = this.showAccountIds();
      const isShow = currentShow.includes(id);
      const updatedShow = isShow
        ? currentShow.filter(item => item !== id)
        : [...currentShow, id];

      this.showAccountIds.set(updatedShow);
      localStorage.setItem('showAccountIds', JSON.stringify(updatedShow));
    } else {
      const currentHidden = this.hiddenAccountIds();
      const isHidden = currentHidden.includes(id);

      const updatedHidden = isHidden
        ? currentHidden.filter(item => item !== id)
        : [...currentHidden, id];

      this.hiddenAccountIds.set(updatedHidden);
      localStorage.setItem('hiddenAccountIds', JSON.stringify(updatedHidden));
    }

  }
  loadShowAccountIdsFromStorage(): void {

    if (typeof window === 'undefined') return;

    const showIds = localStorage.getItem('showAccountIds');
    if (showIds) {
      try {
        const parsed = JSON.parse(showIds);
        if (parsed && Array.isArray(parsed)) {
          this.showAccountIds.set(parsed);
        } else {
          this.showAccountIds.set([]);
        }
      } catch (error) {
      }
    } else {
      this.showAccountIds.set([]);
    }


    const hiddenIds = localStorage.getItem('hiddenAccountIds');
    if (hiddenIds) {
      try {
        const parsed = JSON.parse(hiddenIds);
        if (parsed && Array.isArray(parsed)) {
          this.hiddenAccountIds.set(parsed);
        } else {
          this.hiddenAccountIds.set([]);
        }
      } catch (error) {
      }
    } else {
      this.hiddenAccountIds.set([]);
    }
  }

  private loadInitialData() {
    this.accountStore.getAccountBalance('UZS');
    this.getAccountList();
    this.getCards();
    this.getDeposits();
    this.getCredits();
  }

  setActive(k: TabKey) {
    this.active.set(k);
    this.getTotalBalance(k);
    if (k == 'credits') {
      this.getCurrencyListCredit();
    } else {
      this.getCurrencyAndAccountResponseTypes();
    }
  }


  private getAccountList() {
    this.isLoading.set(true);
    this._accountService
      .getPinnedAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false);
        if (!res) return;
        this.accounts.set(res.accounts);
      });
  }

   getCards() {
    this.cardService
      .getPinnedCards()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.cards.set((res?.cards ?? []));
      });
  }
  refreshCardList(): void{
    this.getCards()
  }

  getDeposits() {
    this.depositService
      .getPinnedDeposits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) this.deposits.set(res.deposits ?? []);
      });
  }

  private getCredits() {
    this.loanService
      .getPinnedLoanList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) this.credits.set(res.content ?? []);
      });
  }

  protected getAccountBalance(currency: string) {
    this._accountService
      .getAccountBalance({ currency })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.currentlyAmount) this.balance.set(res.currentlyAmount);
      });
  }

  openWidgets() {
    this.isLoading.set(true);

    forkJoin({
      dailyTransaction: this.accountsAndPaymentService.getDailyTransaction(),
      currencyRates: this.rightBarService.getCurrencyRate(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ dailyTransaction, currencyRates }) => {
          this.isLoading.set(false);
          if (!dailyTransaction || !currencyRates) return;

          const seen = new Set<string>();


          const courses = currencyRates.result?.data?.content
            ?.filter((item: { alias: string }) => {
              if (seen.has(item.alias)) return false;
              seen.add(item.alias);
              return true;
            });

          this.dialog.open(WidgetsComponent, {
            data: { dailyTransaction, courses },
            width: '500px',
            height: 'calc(100% - 16px)',
            position: { right: '0' },
            panelClass: 'right-side-dialog',
          });
        },
        error: () => this.isLoading.set(false),
      });
  }

  openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '520px',
      height: 'calc(100vh - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: {active:this.active()}
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadInitialData()
    });
  }
  routerNavigate(event: string) {
    switch (event) {
      case 'счета':
        return this.router.navigate(['/accounts'])
      case 'карты':
        return this.router.navigate(['/corp-card-project/corp-cards'])
      case 'депозиты':
        return this.router.navigate(['/deposits/my-deposits'])
      case 'кредиты':
        return this.router.navigate(['/loan/main/my'])
    }
    return event
  }


  pinLoan (loan:any) {
    // loanId: string, hasPin: boolean = false
    if (loan.pinned) {
      this.loanService.unPinLoan(loan.loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getCredits());
    } else {
      this.loanService.pinLoan(loan.loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getCredits());
    }
  }



 getTranslateText(s: TabKey): string {

    const dict: Record<TabKey, string> = {
      accounts: 'accounts.all_accounts',
      cards: 'accounts.all_cards',
      deposits: 'new_second.all_deposits',
      credits: 'new_second.all_credits',
    };

    const text =  dict[s] ? this.translateService?.instant(dict[s]): ""
    return text;
  }

  protected readonly MAIN_COMPONENT_PRODUCTS = MAIN_COMPONENT_PRODUCTS;
  protected readonly getTranslate = getTranslate;
}
