
import { NgIf, } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from "@ngx-translate/core"
import { Component, computed, inject, OnInit, signal, } from '@angular/core';


import { NgxMaskPipe } from 'ngx-mask';
import { MatTooltip } from "@angular/material/tooltip";
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Kartoteka2TooltipDialogComponent } from "./components/tooltip/kartoteka-tooltip";


import { BaseKartotekaStore } from '../store/base-kartoteka-store';
import { Kartoteka2Store } from '../store/kartoteka2.store';
import { KartotekaService } from '../services/kartoteka.service';

import { FilterRequest, STATUSES } from '../models/kartoteka.model';


import { BalanceComponent } from "src/app/shared/components/balance/balance";
import { Kartoteka2TabComponent, TabValue } from './components/tabs/kartoteka2-tab';
import { FilterComponent } from './components/filter/filter';
import { ReservesComponent } from './components/reverves/reserves.component'
import { PaginationComponent } from "../../../../../shared/components/pagination/pagination.component";
import { Kartoteka2DetailsComponent } from "./components/kartoteka-details/kartoteka2-details.component"

import { getFormattedAmount } from 'src/app/core/utils/global-filter.util';

import { UserService } from "../../../../../core/services/user.service";
import { ServiceControllerStore } from "../../../../../core/components/service-controller-check/service-controller.store";
import {SvgIconComponent} from "../../../../../shared/components/svg-icon/svg-icon.component";



@Component({
  selector: 'app-kartoteka-2',
  imports: [
    BalanceComponent,
    Kartoteka2TabComponent,
    FilterComponent,
    PaginationComponent,
    NgxMaskPipe,
    MatMenuTrigger,
    MatMenu,
    NgIf,
    TranslateModule,
    MatTooltip,
    ReservesComponent,
    SvgIconComponent
  ],
  templateUrl: './kartoteka-2.component.html',
  styles: `
  `,
})



export class Kartoteka2Component implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog)
  protected kartotekaService = inject(KartotekaService)
  protected baseKartotekaStore = inject(BaseKartotekaStore)
  protected kartoteka2Store = inject(Kartoteka2Store)

  public userService = inject(UserService)
  private serviceStore = inject(ServiceControllerStore);


  protected kartoteka2AmountDetails = signal<{ name: string; amount: number; account: string }[]>([
    {
      name: 'cardFileTwo.reserved_amount_on_account',
      account: '20208 *** 1000',
      amount: 0,
    },
    {
      name: 'cardFileTwo.urgent_needs_amount_on_account',
      account: '20208 *** 1000',
      amount: 0,
    },
  ]);


  protected globalHideBalance = signal<boolean>(false);
  protected activeTab = signal<TabValue>("ALL")
  protected isVisible = signal(true)

  protected statusList = computed(() => {
    switch (this.activeTab()) {
      case 'ACTIVE':
        return ['ACTIVE', 'PARTIAL_CLOSED'];
      case 'DELETED':
        return ['DELETED'];
      default:
        return [];
    }
  });


  activeCardsLength = computed(() => {
    if (this.activeTab() === 'ACTIVE') {
      localStorage.setItem("acTiveKartotekaLength", JSON.stringify(this.baseKartotekaStore.content().length ?? 0))
      return this.baseKartotekaStore.content().length;
    } else {
      const result = localStorage.getItem("acTiveKartotekaLength")
      return result ? +result : 0
    }
  });


  ngOnInit(): void {
    this.serviceStore.setServices(['IABS']);
    const initialTab = (this.route.snapshot.queryParamMap.get('tab') as TabValue) ?? 'ALL';
    this.onTabChanged(initialTab);
    this.kartoteka2Store.loadStatuses()
    this.balanceTrigger()
  }


  protected onTabChanged(tab: TabValue) {
    if (tab == "ACTIVE" || tab == "DELETED") {
      this.isVisible.set(false)
    } else {
      this.isVisible.set(true)
    }
    this.activeTab.set(tab)
    this.loadList();
  }

  protected loadList(filter?: FilterRequest) {
    const statuses = this.statusList() as STATUSES[];


    const finalFilter: FilterRequest = {
      ...(filter ?? {}),
      ...(statuses.length ? { statusList: statuses } : {}),
    };

    this.baseKartotekaStore.loadKartotekaList({ paging: { page: this.baseKartotekaStore.pageNumber(), size: this.baseKartotekaStore.pageSize() }, cardFileType: 2, filter: finalFilter })
  }



  protected downloadPdf(documentId: number) {
    this.kartotekaService
      .getFileById({ documentId: documentId, fileType: "PDF" })
      .subscribe((transaction) => {
        if (transaction?.file) {
          const byteCharacters = atob(transaction.file);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `transaction-${documentId}.pdf`;
          link.click();

          URL.revokeObjectURL(link.href);
        } else {
          console.error('PDF file not found!');
        }
      });
  }

  protected openDetails(card: any) {
    this.dialog.open(Kartoteka2DetailsComponent, {
      data: {
        card: card,
      },
      width: '590px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    });
  }

  protected getVisible(status: string) {
    if (!status || status !== "DELETED") {
      return false
    } else {
      return true
    }

  }

  protected openKartoTeka2TooltipDialog(): void {
    this.dialog.open(Kartoteka2TooltipDialogComponent, {
      data: {},
      width: '481px',
    });
  }

  protected balanceTrigger() {
    const saved = localStorage.getItem('hideKartotekaBalance');
    if (saved !== null) {
      this.globalHideBalance.set(JSON.parse(saved));
    }
  }

  protected toggleGlobalHide(): void {
    const newVal = !this.globalHideBalance();
    this.globalHideBalance.set(newVal);
    localStorage.setItem('hideKartotekaBalance', JSON.stringify(newVal));
  }

  protected getSelectedStatus(status: STATUSES): { name: string; value: string; img: string } | null {
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
  protected filterChangeAction (filter?: FilterRequest) {
    this.baseKartotekaStore.pageNumber.set(0)
    this.loadList(filter);
  }
  protected readonly Math = Math;
  protected readonly Number = Number;
  protected getFormattedAmount = getFormattedAmount
}
