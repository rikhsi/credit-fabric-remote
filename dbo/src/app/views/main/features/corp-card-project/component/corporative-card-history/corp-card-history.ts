// Angular
import { TranslateModule, TranslateService } from "@ngx-translate/core"
import { ActivatedRoute, Router } from "@angular/router";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';


import { PaymentComponent } from './table/table';
import { CardCardHistoryFilter } from './filter/filters';
import { formatDate } from "src/app/core/utils/date.utils";
import { SkeletonComponent } from 'src/app/shared/components/ui/skeleton';
import { TransactionFilterRequest } from "../../model/transaction-history.model";
import { CorpCardTransactionHistoryStore } from "../../store/transactions-history.store";
import { TransactionHistoryTabs } from "../../constants/corp-card-constants";
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {EmptyStateComponent} from "../../../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'CorpCardHistory',
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    SkeletonComponent,
    PaymentComponent,
    MatExpansionModule,
    CardCardHistoryFilter,
    InfiniteScrollDirective,
    TranslateModule,
    NgOptimizedImage,
    MatTooltipModule,
    EmptyStateComponent
  ],
  templateUrl: './corp-card-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CorpCardHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute)
  public router = inject(Router)
  protected transactionHistoryStore = inject(CorpCardTransactionHistoryStore)
   private translate = inject(TranslateService);
  private  userService = inject(UserService)
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  cardId = "";
  reloading = false;
  filter: TransactionFilterRequest = {};
  readonly activeTab = signal<string>("");
  readonly currentTab = signal<string>('history');
  isFiltering = signal(false)

  ngOnInit(): void {
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }

    this.cardId = this.route.snapshot.paramMap.get('id')!;
    this.transactionHistoryStore.loadTransactionsHistory({
      uuid: this.cardId,
      paging: { page: 0, size: this.transactionHistoryStore.pageSize() },
    });
  }

  handleHasFilter(hasFilter:boolean) {
    this.isFiltering.set(hasFilter);
  }

  protected setActiveTab(tab: string): void {
    if (this.currentTab() === tab) return;
    this.currentTab.set(tab);
    this.transactionHistoryStore.content.set([])
    this.transactionHistoryStore.grouped.set([])

    this.transactionHistoryStore.loadTransactionsHistory({
      uuid: this.cardId,
      paging: { page: 0, size: this.transactionHistoryStore.pageSize() },
      isSignable: tab == "signature" ? true : false
    });


    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  protected isActive(tab: string): boolean {
    return this.currentTab() === tab;
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


  setFilter(value: any) {
    this.reloading = true;
    this.transactionHistoryStore.content.set([])
    this.transactionHistoryStore.grouped.set([])

    this.filter = {
      startDate: this.formatDate(value?.startDate, "YYYYMMDD", "-") ?? undefined,
      endDate: this.formatDate(value?.endDate, "YYYYMMDD", "-") ?? undefined,
      isCredit: value?.isCredit ? value?.isCredit : undefined,
      searchText: value?.searchText ? value?.searchText?.trim() : undefined,
      fromAmount: value?.fromAmount ? value?.fromAmount * 100 : undefined,
      toAmount: value?.toAmount ? value?.toAmount * 100 : undefined,
      status: value?.status ? value?.status : undefined
    };


    this.transactionHistoryStore.loadTransactionsHistory({
      uuid: this.cardId,
      paging: { page: 0, size: this.transactionHistoryStore.pageSize() },
      ...this.filter
    });
    this.reloading = false;
  }

  protected onScroll() {
    if (this.transactionHistoryStore.totalItems() === this.transactionHistoryStore.content()?.length) return
    this.transactionHistoryStore.pageNumber.update(p => p + 1);
    const pagecount = this.transactionHistoryStore.pageNumber();
    this.transactionHistoryStore.loadTransactionsHistory({
      uuid: this.cardId,
      paging: { page: pagecount, size: this.transactionHistoryStore.pageSize() }
    });
  }

  protected checkUrl() {
    return window.location.pathname === '/history';
  }

  protected formatDocDate(date: string): string {
    const [year, month, day] = date.split("-");
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"
    ];

    const monthName = months[parseInt(month, 10) - 1];

    return `${parseInt(day, 10)} ${this.translate.instant(`months.${monthName}`)} ${year}`;
  }

  protected formatDate = formatDate
  protected readonly Object = Object;
  protected readonly Number = Number
  protected TransactionHistoryTabs = TransactionHistoryTabs
}
