import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { NgClass, NgFor } from '@angular/common';
import { TabsStore } from '../../store/tabs.store';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  selector: 'app-another-tabs',
  standalone: true,
  imports: [NgClass, NgFor, TranslateModule],
  templateUrl: './another-tabs.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class AnotherTabsComponent implements OnInit {
  private readonly store = inject(TabsStore);

  @Input({ required: true }) tabs: string[] = [];
  @Output() activatedTab = new EventEmitter<string>();

  readonly activeTab = signal<string | null>(null);

  ngOnInit() {
    if (this.tabs.length > 0) {
      this.store.init(this.tabs);
      this.activeTab.set(this.store.activeTab());
    }
  }

  setActive(tab: string): void {
    this.store.setActive(tab);
    this.activeTab.set(tab);
    this.activatedTab.emit(tab);
  }

  getTabLabel(tab: string): string {
    switch (tab) {
      case 'ALL':
        // return 'Все счета';
        return 'accounts.all';
      case 'SUM':
        // return 'Сумовые';
        return 'accounts.in_sums'
      case 'UZS':
        // return 'Сумовые';
        return 'accounts.in_sums'
      case 'FOREIGN':
        // return 'Валютные';
        return 'accounts.foreign_currency'
      case 'All_CARDS':
        // return ' Все карты ';
        // return 'accounts.all_cards'
        return 'cardFileTwo.all'
      default:
        return tab;
    }
  }


  isActive(tab: string): boolean {
    return this.activeTab() === tab;
  }

}
