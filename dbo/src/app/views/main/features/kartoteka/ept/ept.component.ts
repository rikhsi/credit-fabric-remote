import { NgIf } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';

import { MatDialog } from "@angular/material/dialog";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { PaginationComponent } from "../../../../../shared/components/pagination/pagination.component";
import { EPTDetailsComponent } from "./components/ept-details/ept-details.component"

import { BaseEPTStore } from "../store/ept-store";
import { Kartoteka2Store } from "../store/kartoteka2.store";
import { FilterComponent } from "./components/filter/filter";
import { UserService } from "../../../../../core/services/user.service";
import { EPTFilterRequest, TransactionContent } from "../models/kartoteka.model";
import { getFormattedAmount } from 'src/app/core/utils/global-filter.util';
import { TabsComponent, TabValue } from "./components/tabs/tabs.component";
import { ServiceControllerStore } from "../../../../../core/components/service-controller-check/service-controller.store";


@Component({
  selector: 'app-ept',
  imports: [
    FilterComponent,
    MatMenu,
    NgIf,
    NgxMaskPipe,
    PaginationComponent,
    TranslateModule,
    MatMenuTrigger,
    MatTooltip,
    TabsComponent
  ],
  templateUrl: './ept.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected baseEPTStore = inject(BaseEPTStore)
  protected kartoteka2Store = inject(Kartoteka2Store)
  public userService = inject(UserService)
  private serviceStore = inject(ServiceControllerStore);
  private readonly dialog = inject(MatDialog)

  protected direction = signal("")
  protected activeTab = signal<TabValue>("OUTGOING")
  protected isVisible = signal(false)
  protected globalHideBalance = signal<boolean>(false);


  protected statusList = computed(() => {
    switch (this.activeTab()) {
      case 'INCOMING':
        return ['ACTIVE', 'PARTIAL_CLOSED'];
      default:
        return [];
    }
  });


  tableHeaders = [
    { title: "Номер документа", iconUrl: "/assets/new-icons/kartoteka/arrow-up-down.svg", isIcon: true, isChangeable: false },
    { title: "Дата документа", iconUrl: "/assets/new-icons/kartoteka/arrow-up-down.svg", isIcon: true, isChangeable: false },
    { title: "Наименование плательщика", iconUrl: "/assets/new-icons/kartoteka/arrow-up-down.svg", isIcon: true, isChangeable: true },
    { title: "Сумма", iconUrl: "/assets/new-icons/kartoteka/arrow-up-down.svg", isIcon: true, isChangeable: false },
    { title: "ИНН получателя", iconUrl: "/assets/new-icons/kartoteka/arrow-up-down.svg", isIcon: true, isChangeable: false },
  ]

  activeCardsLength = computed(() => {
    if (this.activeTab() === 'INCOMING') {
      localStorage.setItem("inComingEptLength", JSON.stringify(this.baseEPTStore.content().length ?? 0))
      return this.baseEPTStore.content().length;
    } else {
      const result = localStorage.getItem("inComingEptLength")
      return result ? +result : 0
    }
  });


  ngOnInit(): void {
    this.serviceStore.setServices(['IABS']);
    const initialTab = (this.route.snapshot.queryParamMap.get('tab') as TabValue) ?? 'INCOMING';
    this.onTabChanged(initialTab);
    this.kartoteka2Store.loadStatuses()
  }


  protected onTabChanged(tab: TabValue) {
    if (tab == "INCOMING") {
      this.isVisible.set(true)
      this.direction.set("I")

    } else {
      this.isVisible.set(false)
      this.direction.set("R")
    }
    this.activeTab.set(tab)
    this.loadList();
  }
  protected filterChangeAction (filter?: EPTFilterRequest) {
    this.baseEPTStore.pageNumber.set(0)
    this.loadList(filter);
  }
  protected loadList(filter?: EPTFilterRequest) {
    this.baseEPTStore.loadEPTList({...filter,  direction: this.direction(), page: this.baseEPTStore.pageNumber(), size: this.baseEPTStore.pageSize() })
  }

  protected goToCreateRequirement(): void {
    this.router.navigate(['/EPT/payment']);
  }

  protected openDetails(eptItem: TransactionContent) {
    this.dialog.open(EPTDetailsComponent, {
      data: {
        ...eptItem,
        activeTab:this.activeTab()
      },
      width: '590px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    });
  }


  toggleGlobalHide(): void {
    const newVal = !this.globalHideBalance();
    this.globalHideBalance.set(newVal);
    localStorage.setItem('hideEPTBalance', JSON.stringify(newVal));
  }

  getSelectedStatus(status: any): { name: string; value: string; img: string } | null {
    const selectedStatus = status;
    if (!selectedStatus) return null;

    return this.kartoteka2Store.statusListToMap().find(res => res.value === selectedStatus) || null;
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  protected readonly Math = Math;
  protected readonly Number = Number;
  protected getFormattedAmount = getFormattedAmount
}
