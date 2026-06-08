import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLinkActive, RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-left-menu-item',
    imports: [CommonModule, RouterLinkActive, UiSvgIconComponent, TranslateModule, RouterModule],
    templateUrl: './menu-item.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemComponent {
  @Input() title!: string;
  @Input() icon!: string;
  @Input() miniVariant!: boolean;
  @Input() last = false;

  constructor() {}

  getHref(icon: string) {
    return `./assets/icons/left-menu.svg#${icon}`;
  }
}
