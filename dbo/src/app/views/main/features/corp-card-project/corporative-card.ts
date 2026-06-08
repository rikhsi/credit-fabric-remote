import { NgIf } from "@angular/common";
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from "@angular/material/dialog";
import { TranslateModule } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';


import { BalanceComponent } from "../new-main/components/balance/balance.component";
import { AnotherTabsComponent } from "src/app/shared/components/another-tabs/another-tabs.component";
import { FilterComponent } from "./component/corporative-card/filter/filter"
import { TableComponent } from "./component/corporative-card/table/table"
import { SkeletonComponent } from "src/app/shared/components/ui/skeleton"
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
import { RequisiteComponent } from '../corp-cards/components/requisite/requisite.component';
import { TitleChangeCardComponent } from "../corp-cards/components-2/title-change-card/title-change-card.component";


import { CardStore } from "../../../../store/card.store";
import { CurrencyStore } from "src/app/shared/store/currency.store";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NotificationService} from "../../../../core/services/notification.service";
import {
  ServiceControllerCheckComponent
} from "../../../../core/components/service-controller-check/service-controller-check.component";
import {ServiceControllerStore} from "../../../../core/components/service-controller-check/service-controller.store";
import { SvgIconComponent } from "src/app/shared/components/svg-icon/svg-icon.component";


@Component({
  selector: 'app-corp-card-project',
  imports: [
    BalanceComponent,
    AnotherTabsComponent,
    TranslateModule,
    FilterComponent,
    TableComponent,
    SkeletonComponent,
    PaginationComponent,
    NgIf,
    ServiceControllerCheckComponent,
    SvgIconComponent
  ],
  templateUrl: './corporative-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CorporativeCardComponent implements OnInit {
  @ViewChild(TableComponent) cardItemsComponent!: TableComponent

  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  protected readonly destroyRef = inject(DestroyRef)
  private serviceStore  = inject(ServiceControllerStore);
  protected readonly cardStore = inject(CardStore)
  protected readonly currencyStore = inject(CurrencyStore)

  filter: any;
  globalHideBalance = signal<boolean>(false);
  refreshTrigger = signal(0);
  activeTab = signal<string>('ALL_CARDS');
  isHidden = false;
  hasFilter = signal(false);



  ngOnInit(): void {
    this.serviceStore.setServices(['UZCARD']);
    this.getBalance()
    this.getActiveTab()
    this.getLoadCardInfo()
  }

  handleHasFilter(event:boolean) {
    this.hasFilter.set(event);
  }

  protected getBalance() {
    this.cardStore.getCardsBalance('UZS')
    const savedGlobal = localStorage.getItem('globalHideCorpBalance');
    this.globalHideBalance.set(savedGlobal ? JSON.parse(savedGlobal) : false);
  }

  protected toggleGlobalHide() {
    try {
      const newVal = !this.globalHideBalance();
      this.globalHideBalance.set(newVal);
      localStorage.setItem('globalHideCorpBalance', String(newVal));
      localStorage.removeItem('hiddenCorpCardIds');
      localStorage.removeItem('showCorpCardIds');
      this.cardItemsComponent.loadShowCardsIdFromStorage()
      this.refreshTrigger.update(value => value + 1);
    } catch (e) { }
  }

  private getActiveTab() {
    this.route.queryParamMap.subscribe(params => {
      const activeTab = params.get('tab')
      if (activeTab)
        this.activeTab.set(activeTab);
    });
  }

  protected setTab(tab: string) {
    this.activeTab.set(tab)
    if (tab !== "All_CARDS") {
      this.isHidden = true
    } else {
      this.isHidden = false
    }
    this.getLoadCardInfo()
  }

  protected readonly filteredCards = computed(() => {
    switch (this.activeTab()) {
      case 'UZS':
        return this.cardStore.sumCards();
      case 'FOREIGN':
        return this.cardStore.exchangeCards();
      default:
        return this.cardStore.cards();
    }
  });

  protected isSearchVisivle(): boolean {
    return this.cardStore.totalItems() > 5 ? true : false;
  }

  protected getLoadCardInfo() {
    this.filter = { ... this.filter, page: this.cardStore.pageIndex() || 0, size: this.cardStore.pageSize() || 5 };
    this.cardStore.loadCards(this.filter)
  }

  protected setFilter(value: any) {
    this.filter = value
    this.getLoadCardInfo()
  }

  protected onPinClickCard(item: any) {
    this.filter = { ... this.filter, page: this.cardStore.pageIndex() || 0, size: this.cardStore.pageSize() || 10 };
    this.cardStore.togglePin(item);
  }

  openChangeTitleDialog(data: { title: string; uuid: string }): void {
    if (!data?.uuid) return;
    const dialogRef = this.dialog.open(TitleChangeCardComponent, {
      data,
      width: '400px',
    });
    dialogRef.componentInstance.change.subscribe(() => {
      dialogRef.close();
      this.cardStore.loadCards();
    });
  }
}
