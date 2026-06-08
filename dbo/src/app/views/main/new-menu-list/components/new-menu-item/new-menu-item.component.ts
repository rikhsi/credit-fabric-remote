import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {RouterLinkActive} from "@angular/router";
import {NgClass, NgIf} from "@angular/common";
import {UiSvgIconComponent} from "../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {TranslateModule} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../../firebase-analytics.service";
import {Theme} from "@fullcalendar/core/internal";
import {ThemeService} from "../../../../../shared/services/theme.service";

@Component({
  selector: 'app-new-menu-item',
  imports: [
    RouterLinkActive,
    UiSvgIconComponent,
    TranslateModule,
    NgIf,
    NgClass
  ],
  templateUrl: './new-menu-item.component.html',
  styles: ``,
  styleUrls: ['./new-menu-item.components.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewMenuItemComponent {
  title = input<string>('');
   icon = input<string>('');
   isActive =  input<boolean>();
   miniVariant = input<boolean>()
   subMenu = input<boolean>()
   last = input<boolean>(false)
   link = input<string | undefined | null>('');
  constructor(    private analyticsService: FirebaseAnalyticsService) {
  }

  public theme = inject(ThemeService);
  getHref(icon: string) {
    return `./assets/new-icons/new-left-menu.svg#${icon}`;
  }

  sendEvent(){
    this.analyticsService.logFirebaseCustomEvent('menu_screen_jump', {platform: "web"});

  }
}
