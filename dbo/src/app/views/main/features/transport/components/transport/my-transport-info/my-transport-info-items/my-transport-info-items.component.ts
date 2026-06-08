import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { NgIf, NgClass } from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {TranslateModule} from "@ngx-translate/core";
import {daysInName, TransportTabItem} from "../../../../types/transport.types";

@Component({
  selector: 'app-my-transport-info-items',
  templateUrl: './my-transport-info-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgClass, UiSvgIconComponent, TranslateModule]
})
export class MyTransportInfoItemsComponent {
  @Input() public item = {} as TransportTabItem;
  @Input() public isLoading = true;
  @Output() public clickEv = new EventEmitter<{
    title: string;
    isEdit: boolean;
  }>();

  public style(day: number, type: string): string {
    switch (true) {
      case day >= 0 && day <= 3:
        return type === 'text' ? 'text-error' : 'border-error';
      case day > 3 && day <= 7:
        return type === 'text' ? 'text-yellow-250' : 'border-yellow-250';
      case day > 7:
        return type === 'text' ? 'text-lime-550' : '';
      default:
        return type === 'text' ? 'text-gray-950' : '';
    }
  }

  public formatDate(days: number): string {
    const lang = localStorage.getItem('lang') || 'Ru';
    return daysInName(lang, days);
  }

  public emit(): void {
    this.clickEv.emit({
      title: this.item.title,
      isEdit: this.item.day !== -1
    });
  }
}
