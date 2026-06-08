import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AccountsDto } from "../views/main/features/accounts-payments/models/accounts-payments.model";
import { computed, DestroyRef, inject, Injectable, input, signal, WritableSignal } from "@angular/core";
import { AccountService } from "../core/services/account.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SalaryProjectService } from "../core/services/salary-project.service";
import { PayrollProjectResponseContent } from "../views/main/features/payroll-project/models/payroll-project.type";
import { DepositService } from "../views/main/features/deposits/services/deposit.service";
import { Balance } from "../core/models/backend-response.model";
import { ToastrService } from "ngx-toastr";
import {LoanService} from "../views/main/features/loans/services/loan.service";
import {Loan, LoanDto} from "../views/main/features/loans/models/loan.model";
import {debounceTime, distinctUntilChanged, take} from "rxjs";
import { UtilsService } from "../core/services/utils.service";
import { DEFAULT_PAGE_SIZE } from '../constants';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  readonly balance: WritableSignal<Balance | null> = signal(null);
  unreadCount = signal<number>(0);
  private readonly service = inject(AccountService);
  private readonly cardService = inject(SalaryProjectService);
  private readonly depositService = inject(DepositService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private toastrService = inject(ToastrService)
  private loanService = inject(LoanService)
  private readonly accountService = inject(AccountService)
  private utilsService = inject(UtilsService)
  private translateService = inject(TranslateService)

private readonly PIN_LIMIT_MESSAGES: Record<'account' | 'deposit' | 'card' | 'credit', string> = {
  account: 'custom.pin_only_4_accounts',
  card: 'custom.pin_only_4_cards',
  credit: 'custom.pin_only_4_loans',
  deposit: 'custom.pin_only_4_deposits',
};

  accounts = signal<AccountsDto[]>([]);
  pageIndex = signal<number>(0)
  pageSize = signal<number>(DEFAULT_PAGE_SIZE)
  totalItems = signal<number>(0)
  accountsLoading = signal<boolean>(false)
  isTogglePinUnpinCommingFromAccount = signal<boolean>(false);


  readonly pinnedAccounts = computed(() =>
    this.accounts().filter(acc => acc.hasPinned)
  );

  readonly hiddenAccounts = computed(() =>
    this.accounts().filter(acc => !acc.hasPinned)
  );
  readonly sumAccounts = computed(() =>
    this.accounts().filter(acc => acc.balance?.currency === 'UZS')
  );
  readonly sumCards = computed(() =>
    this.cards().filter(card => card.balance?.currency === 'UZS')
  );
  readonly exchangeCards = computed(() =>
    this.cards().filter(card => card.balance?.currency !== 'UZS')
  );

  readonly exchangeAccounts = computed(() =>
    this.accounts().filter(acc => acc.balance?.currency !== 'UZS')
  );
  // deposits
  readonly deposits = signal<AccountsDto[]>([]);
  readonly pinnedDeposits = computed(() => this.deposits().filter(acc => acc.hasPinned));
  readonly hiddenDeposits = computed(() => this.deposits().filter(acc => !acc.hasPinned));

  // cards
  public readonly cards = signal<PayrollProjectResponseContent[]>([]);
  readonly pinnedCards = computed(() => this.cards().filter(acc => acc.hasPinned));
  readonly hiddenCards = computed(() => this.cards().filter(acc => !acc.hasPinned));

  readonly credits = signal<Loan[]>([]);
  readonly pinnedCredits = computed(() => this.credits().filter(acc => acc.pinned));
  readonly hiddenCredits = computed(() => this.credits().filter(acc => !acc.pinned));

  updatePinnedAccountsOrder(accounts: AccountsDto[]) {
    this.accounts.update(allAccounts => {
      const pinned = allAccounts.filter(x => !x.hasPinned);

      return [
        ...accounts,
        ...pinned
      ];
    });
  }


  updatePinnedCardsOrder(cards: PayrollProjectResponseContent[]) {
    this.cards.update(allCards => {
      const hidden = allCards.filter(x => !x.hasPinned);

      return [
        ...cards,
        ...hidden
      ];
    });
  }

  updatePinnedDepositsOrder(cards: AccountsDto[]) {
    this.deposits.update(deposits => {
      const pinned = deposits.filter(x => !x.hasPinned);

      return [
        ...pinned,
        ...cards
      ];
    });
  }

  updatePinnedCreditsOrder(credit: Loan[]) {
    this.credits.update(item => {
      const pinned = item.filter(x => !x.pinned);

      return [
        ...pinned,
        ...credit
      ];
    });
  }

  loadAccounts(filter = null,useSkeleton = true) {
    if(useSkeleton) {
      this.accountsLoading.set(true);
      }else{
      this.utilsService.spinnerState$$.next(true)
      }
    this.service.getAccountList(filter || { page: 0, size: 100 }, {})
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          if(useSkeleton) {
            this.accountsLoading.set(false);
          }else{
            this.utilsService.spinnerState$$.next(false)
          }

          this.accounts.set(res?.content ?? []);
          this.pageSize.set(res?.pageable?.pageSize || 0);
          this.pageIndex.set(res?.pageable?.pageNumber || 0);
          this.totalItems.set(res?.totalElements || 0);
        },
        error: (err) => {
          if(useSkeleton) {
            this.accountsLoading.set(false);
          }else{
            this.utilsService.spinnerState$$.next(false)
          }
          console.error('Error while loading accounts:', err);
        }
      }

      );
  }
  loadCards() {
    this.cardService.getAllPayrollProjectList({ page: 0, size: 100, userType: 'CORPORATE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.cards.set(res?.content ?? []);
      });
  }

  loadDeposits() {
    this.depositService.depositContactListV2( 0,  100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.deposits.set(res?.content ?? []);
      });
  }

  loadCredits() {
    this.loanService.getLoanList({status:'OPEN'}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res) {
          this.credits.set(res?.content)
        }
      }
    })
  }


  getAccountBalance(currency: string, acountFilter?: { searchText: string, currencyEnum: string[], accountPrefixes: string[], isActive: boolean}) {
    this.service
      .getAccountBalance(acountFilter ? { currency: currency, accountFilter: {
          searchText: acountFilter.searchText,
          accountPrefixes: acountFilter.accountPrefixes,
          currencyEnum: acountFilter.currencyEnum,
          isActive: acountFilter.isActive,
        } } : { currency })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.currentlyAmount) {
          this.balance.set(res.currentlyAmount);
        }
      });
  }

 getAccountBalanceNew(data: { currency: string, module?: string, accountFilter?: any }) {
    this.service
      .getAccountBalance(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.currentlyAmount) {
          this.balance.set(res.currentlyAmount);
        }
      });
  }

  private getPinLimitErrorMessage(type: 'account' | 'deposit' | 'card' | 'credit'): string {
    const key = this.isTogglePinUnpinCommingFromAccount()
      ? this.PIN_LIMIT_MESSAGES[type]
      : 'custom.unpin_one_to_add_new';

    return this.translateService.instant(key);
  }


  togglePin(
    item: any,
    type: 'account' | 'deposit' | 'card' | 'credit',
    filter?: any,
  ) {
    const isPinned = type === 'credit' ? item.pinned :  item.hasPinned;

    if (type === 'account') {
      if (isPinned) {
        this.service.unpinAccount(item.id, item.altAcctId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadAccounts(filter,false),
            error: () => this.showError('Не удалось открепить счёт')
          });
      } else {
        if (this.pinnedAccounts().length >= 4) {
           this.toastrService.info(this.getPinLimitErrorMessage(type));
          this.isTogglePinUnpinCommingFromAccount.set(false)
          return;
        }
        this.service.createPin(item.id, item.altAcctId, item.codeFilial)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadAccounts(filter,false),
            error: () => this.showError('Не удалось закрепить счёт')
          });
      }
    }

    if (type === 'deposit') {
      if (isPinned) {
        this.depositService.unpinDeposit(item.contractId, item.account)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadDeposits(),
            error: () => this.showError('Не удалось открепить депозит')
          });
      } else {
        if (this.pinnedDeposits().length >= 0) {
        this.toastrService.info(this.getPinLimitErrorMessage(type));

          this.isTogglePinUnpinCommingFromAccount.set(false)
          return;
        }
        this.depositService.createPinDeposit(item.contractId, item.account,"")
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadDeposits(),
            error: () => this.showError('Не удалось закрепить депозит')
          });
      }
    }

    if (type === 'card') {
      if (isPinned) {
        this.cardService.unpinCard(item.uuid)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadCards(),
            error: () => this.showError('Не удалось открепить карту')
          });
      } else {
        if (this.pinnedCards().length >= 4) {
           this.toastrService.info(this.getPinLimitErrorMessage(type));
          this.isTogglePinUnpinCommingFromAccount.set(false)

          return;
        }
        this.cardService.createPinCard(item.uuid)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadCards(),
            error: () => this.showError('Не удалось закрепить карту')
          });
      }
    }
    if (type === 'credit') {
      if (isPinned) {
        this.loanService.unPinLoan(item.loanId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadCredits(),
            error: () => this.showError('Не удалось открепить кредит')
          });
      } else {
        if (this.pinnedCredits().length >= 4) {
           this.toastrService.info(this.getPinLimitErrorMessage(type));
          this.isTogglePinUnpinCommingFromAccount.set(false)
          return;
        }
        this.loanService.pinLoan(item.loanId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.loadCredits(),
            error: () => this.showError('Не удалось закрепить кредит')
          });
      }
    }

  }


  private updateLocal(accountId: number, pinned: boolean) {
    this.accounts.update(list =>
      list.map(acc =>
        acc.id === accountId ? { ...acc, hasPinned: pinned } : acc
      )
    );
  }
  loadUnreadCount() {
    this.accountService.getNotificationUnReadCount()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.unreadCount.set(res?.result?.data?.count || 0);
          } else {
            this.unreadCount.set(0);
          }
        },
        error: (err) => {
          this.unreadCount.set(0);
        }
      });
  }
  private showError(message: string) {
    this.toastrService.error(message);
    // this.snackBar.open(message, 'Закрыть', { duration: 3000 });
  }
}
