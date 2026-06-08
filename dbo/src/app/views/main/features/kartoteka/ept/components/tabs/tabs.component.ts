// Angular
import { NgClass, NgIf } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core"
import { Router, ActivatedRoute } from '@angular/router';
import {MatTooltip} from "@angular/material/tooltip";
import { ChangeDetectionStrategy, Component, inject, output, signal, effect, input } from '@angular/core';


import { BaseKartotekaStore } from '../../../store/base-kartoteka-store';
import { KartotekaService } from '../../../services/kartoteka.service';
import {UserService} from "../../../../../../../core/services/user.service";



export type TabValue = 'INCOMING' | 'OUTGOING';

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
  selector: 'app-tabs',
  imports: [
    NgIf,
    TranslateModule,
    NgClass,
    MatTooltip
  ],
  templateUrl: './tabs.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected baseKartotekaStore = inject(BaseKartotekaStore)
  protected kartotekaService = inject(KartotekaService)
  protected userService = inject(UserService)

  readonly activeTab = output<TabValue>();
  readonly activeCardsLength = input<number>(0);
  readonly currentTab = signal<TabValue>('OUTGOING');


  protected tabs = signal<Tab[]>([
    { label: 'cardFileTwo.out_going', value: 'OUTGOING' },
    { label: 'cardFileTwo.in_coming', value: 'INCOMING' },
    
  ]);


  readonly headerActions = signal<HeaderAction[]>([
    { img: './assets/new-icons/download-circle.svg', name: 'cardFileTwo.download', action: 'download' },
    { img: './assets/new-icons/printer-active.svg', name: 'main.print', action: 'print' },
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
    return ['INCOMING', 'OUTGOING'].includes(tab);
  }
}
