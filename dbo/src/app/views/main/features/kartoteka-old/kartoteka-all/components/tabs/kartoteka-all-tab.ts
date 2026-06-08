// Angular
import { NgClass, NgIf } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core"
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject, output, signal, effect, input } from '@angular/core';
import { Kartoteka2Store } from '../../store/kartoteka2.store';
import { Kartoteka2Service } from '../../services/kartoteka2.service';
import {MatTooltip} from "@angular/material/tooltip";
import {UserService} from "../../../../../../../core/services/user.service";



export type TabValue = 'ALL' | 'ACTIVE' | 'DELETED';

interface Tab {
  label: string;
  value: TabValue;
}

interface HeaderAction {
  img: string;
  name: string;
  action: string;
}



@Component({
  selector: 'kartoteka-all-tab',
  imports: [NgClass, NgIf, TranslateModule, MatTooltip],
  templateUrl: './kartoteka-all-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class KartotekaAllTabComponent  {
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected kartotekaStore = inject(Kartoteka2Store)
  protected kartoteka2service = inject(Kartoteka2Service)
  protected userService = inject(UserService)
  readonly activeTab = output<TabValue>();
  readonly activeCardsLength = input<number>(0);
  readonly currentTab = signal<TabValue>('ACTIVE');


  protected tabs = signal<Tab[]>([
    { label: 'Входящие', value: 'DELETED' },
    { label: 'Истекает срок акцепта', value: 'ACTIVE' },
  ]);


  readonly headerActions = signal<HeaderAction[]>([
    { img: './assets/new-icons/download-circle.svg', name: 'cardFileTwo.download', action: 'download' },
    // { img: './assets/new-icons/printer-active.svg', name: 'main.print', action: 'print' },
  ]);


  constructor() {
    this.currentTabTrigger()
    effect(() => {
      this.currentTabTrigger()
    });
  }



  private currentTabTrigger() {
    const tabParam = this.route.snapshot.queryParamMap.get('tab') as TabValue | null;
    if (tabParam && this.isValidTab(tabParam)) {
      this.currentTab.set(tabParam)
      this.activeTab.emit(tabParam);
    }
  }

  protected setActiveTab(tab: TabValue): void {
    if (this.currentTab() === tab) return;
    this.currentTab.set(tab);
    this.activeTab.emit(tab);

    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  protected isActive(tab: TabValue): boolean {
    return this.currentTab() === tab;
  }

  private isValidTab(tab: string): tab is TabValue {
    return ['ALL', 'ACTIVE', 'DELETED'].includes(tab);
  }

  protected downloadTrigger() {
    return this.currentTab() === "DELETED" ? true : false
  }

  protected downloadExcel() {
    this.kartoteka2service
      .getFiles({
        fileType: "EXCEL",
        cardFileType: this.kartotekaStore.payload()?.cardFileType ?? 2,
        filter: this.kartotekaStore.payload()?.filter
      })
      .subscribe((transaction) => {
        if (transaction?.file) {
          const byteCharacters = atob(transaction.file);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `kartoteka2-file.xlsx`;
          link.click();

          URL.revokeObjectURL(link.href);
        } else {
          console.error('Excel file not found!');
        }
      });
  }

}
