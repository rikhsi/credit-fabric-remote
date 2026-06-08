import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BalanceComponent } from "../new-main/components/balance/balance.component";
import { AccountStore } from "../../../../store/account.store";
import { AnotherTabsComponent } from "../../../../shared/components/another-tabs/another-tabs.component";
import { NewAccountItemsComponent } from "./components/new-account-items/new-account-items.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { RequisiteComponent } from "../corp-cards/components/requisite/requisite.component";
import { AccountService } from "../../../../core/services/account.service";
import {
  AccountFilterPaymentComponent
} from "../../../../shared/components/account-filter-payment/account-filter-payment.component";
import {  debounceTime, distinctUntilChanged, Subject, tap } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { NgIf } from "@angular/common";
import { catchError, forkJoin, of } from "rxjs";
import { TranslateModule } from '@ngx-translate/core';
import { AccountResponseType } from 'src/app/core/models/currencies-account-reponse-types.model';
import {
  ServiceControllerCheckComponent
} from "../../../../core/components/service-controller-check/service-controller-check.component";
import {ServiceControllerStore} from "../../../../core/components/service-controller-check/service-controller.store";
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-new-accounts',
  imports: [
    BalanceComponent,
    AnotherTabsComponent,
    NewAccountItemsComponent,
    AccountFilterPaymentComponent,
    PaginationComponent,
    NgIf,
    TranslateModule,
    ServiceControllerCheckComponent,
    MatDividerModule
  ],
  templateUrl: './new-accounts.component.html',
  styles: `
  :host {
  .scrollable-row {
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.15) transparent;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.15);
      border-radius: 10px;
    }
  }
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewAccountsComponent implements OnInit {
  readonly accountStore = inject(AccountStore)
  private readonly accountService = inject(AccountService)
  readonly destroyRef = inject(DestroyRef)
  readonly matDialog = inject(MatDialog)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private serviceStore = inject(ServiceControllerStore)

  private _loadAccountTrigger$$ = new Subject<void>();
  loadAccountTrigger$$ = this._loadAccountTrigger$$.asObservable()

  canGetDataVieFilter = signal<boolean>(false)
  @ViewChild(NewAccountItemsComponent) accountItemsComponent!: NewAccountItemsComponent
  filter: any;
  globalHideBalance = signal<boolean>(false);
  refreshTrigger = signal(0);
  accountResponseType = signal<AccountResponseType[]>([]);
  currencyList = signal<{ code: string; flag: string }[]>([])
  searchText = signal('');

  title = signal('accounts.total_balance_in')
  isFilterLoaded = signal(false)
  activeTab = signal<string>('ALL');
  hasFilter = signal(false)

  ngOnInit(): void {
    this.serviceStore.setServices(['IABS']);
    this.accountStore.getAccountBalanceNew({currency:'UZS',module:'ACCOUNT'})
    const savedGlobal = localStorage.getItem('globalHideBalance');
    this.globalHideBalance.set(savedGlobal ? JSON.parse(savedGlobal) : false);
    this.handleQuaryParam()
    this.getCurrencyAndAccountResponseTypes()
    this.handleLoadAccountTrigger()
  }

  private handleLoadAccountTrigger() {
    this.loadAccountTrigger$$.pipe(
      debounceTime(500),
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
          this.accountStore.loadAccounts(this.filter)
      })
    ).subscribe()
  }


  onHasAnyFilter(hasFilter: boolean) {
    this.hasFilter.set(hasFilter);
  }



  private handleQuaryParam() {
    this.activatedRoute.queryParams.pipe(
      distinctUntilChanged(),
      tap((param) => {
        if (param['tab']) {
          let tab = param['tab'];
          if (tab == 'ALL' || tab == 'SUM' || tab == 'FOREIGN') {
            this.setTab(tab)
            setTimeout(() => {
              this.canGetDataVieFilter.set(true)
            }, 500);
          }
        } else {
          // Default tab set to ALL don't touch it !!!
          this.router.navigate([], {
            queryParams: { tab: this.activeTab() },
            queryParamsHandling: 'merge',
          });

        }
      })
    ).subscribe()
  }

  private getCurrencyAndAccountResponseTypes() {
    this.accountService.getCurrencyAndAccountResponseTypes().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res) => {
      if (res) {
        this.accountResponseType.set(res.accountResponseType);
        this.currencyList.set(res.currencyList.map((v => ({
          code: v.name,
          flag: v.logo.path + v.logo.name
        }))));
      }
    });
  }


  setTab(tab: any) {
    this.activeTab.set(tab)
    this.filter = { ...this.filter, currencyType: this.activeTab() };
    this.accountStore.pageIndex.set(0)
    this._loadAccountTrigger$$.next()
    const filterAcc =
       tab === 'SUM' ? {currency:'UZS', accountFilter: {currencyType: "SUM"}}
          : tab === 'FOREIGN' ?  {currency:'UZS', accountFilter: {currencyType: "FOREIGN"}} :
           {currency:'UZS',module:'ACCOUNT'}
    this.accountStore.getAccountBalanceNew(filterAcc)
  }


  setFilter(value: any) {
    if(value && value.accountPrefixes && value.accountPrefixes.length) {
        if(value.accountPrefixes.includes("SETTLEMENT_NEW")) {
          this.title.set('accounts.total_balance_in_kredet')
        }else {
          this.title.set('accounts.total_balance_in')
        }
    }else {
       this.title.set('accounts.total_balance_in')
    }
    this.searchText.set(value.searchText)
    this.accountStore.pageIndex.set(0)
    this.filter = { ...value, currencyType: this.activeTab(), page: this.accountStore.pageIndex() || 0, size: this.accountStore.pageSize() || 10 };
    this._loadAccountTrigger$$.next()
    if(this.hasFilter()) {
      this.accountStore.getAccountBalance('UZS', {
        accountPrefixes: value.accountPrefixes ?? null,
        searchText: value.searchText ?? null,
        currencyEnum: value.currencyEnum ?? null,
        isActive: value.isActive ?? undefined,
      })
    }else {
        this.accountStore.getAccountBalanceNew({currency:'UZS',module:'ACCOUNT'})
    }

  }

  getLoadAccountInfo() {
    this.filter = { ... this.filter, currencyType: this.activeTab(), page: this.accountStore.pageIndex() || 0, size: this.accountStore.pageSize() || 10 };
    this._loadAccountTrigger$$.next()
  }

  onPinClickAccount(item) {
    this.filter = { ... this.filter, currencyType: this.activeTab(), page: this.accountStore.pageIndex() || 0, size: this.accountStore.pageSize() || 10 };
    this.accountStore.isTogglePinUnpinCommingFromAccount.set(true)
    this.accountStore.togglePin(item, 'account', this.filter);
    // this._loadAccountTrigger$$.next()

  }

  toggleGlobalHide() {
    try {
      const newVal = !this.globalHideBalance();
      this.globalHideBalance.set(newVal);
      localStorage.setItem('globalHideBalance', String(newVal));
      localStorage.removeItem('hiddenAccountIds');
      localStorage.removeItem('showAccountIds');
      this.accountItemsComponent.loadShowAccountIdsFromStorage()
      this.refreshTrigger.update(value => value + 1);

    } catch (e) { }
  }

  accountInfo(event: { altAcctId: string | undefined; id: number | undefined }) {
    // let detailModalData = {}
    // if (!event.altAcctId)  return
    // this.accountService.getAccountInfo(event?.altAcctId).pipe()
    //   .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
    //   if (!res) return
    //   detailModalData = res
    //   })
    // if (event?.id) {
    //   this.accountService.getAccountQr({accountId: event.id.toString()}).pipe()
    //     .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
    //     if (!response) return
    //     detailModalData = {...detailModalData, response}
    //   })
    // }


    // this.matDialog.open(RequisiteComponent, {
    //   data: detailModalData,
    //   width: '475px',
    //   height: 'calc(100% - 16px)',
    //   position: {
    //     right: '0',
    //   },
    //   panelClass: 'right-side-dialog',
    // })


    if (!event.altAcctId || !event.id) return;
    const accountInfo$ = this.accountService.getAccountInfo(event.altAcctId).pipe(
      catchError((err) => {
        return of(null);
      })
    );

    const accountQr$ = this.accountService.getAccountQr({ accountId: event.id.toString() }).pipe(

      catchError((err) => {
        return of(null);
      })
    );

    forkJoin([accountInfo$, accountQr$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([info, qr]) => {
        const detailModalData: any = {};
        if (info) {
          Object.assign(detailModalData, info);
        }

        if (qr) {
          detailModalData.qr = qr?.msg || '';
        }

        this.matDialog.open(RequisiteComponent, {
          data: detailModalData,
          width: '475px',
          height: 'calc(100% - 16px)',
          position: {
            right: '0',
          },
          panelClass: 'right-side-dialog',
        });
      });
  }
}
