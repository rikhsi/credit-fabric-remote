import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import { UtilsService } from '../../../core/services/utils.service';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { MenuList } from './models/menu-list.model';
import { UserService } from '../../../core/services/user.service';
import { MAIN_MENU_LIST, NOTIFICATIOIN_MENU_LIST, PROFILE_MENU_LIST, SETTINGS_MENU_LIST } from './menu-list';

@Component({
  selector: 'app-menu-list',
  imports: [
    CommonModule,
    MenuItemComponent,
    RouterLink,
    MatRippleModule,
    RouterLinkActive,
    MatTooltipModule,
    TranslateModule,
    NgOptimizedImage,
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuListComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<boolean>(false);
  miniVariant = false;
  mainMenuList: MenuList[] = MAIN_MENU_LIST
  profileMenuList:MenuList[] = PROFILE_MENU_LIST  
  settingsMenuList:MenuList[] = SETTINGS_MENU_LIST;
  notificationMenuList: MenuList[] = NOTIFICATIOIN_MENU_LIST


  constructor(
    private destroyRef: DestroyRef,
    private router: Router,
    public utilsService: UtilsService,
    private userService: UserService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {

      if (event instanceof NavigationStart && event?.url?.split('/')[1] === 'settings') this.utilsService.menuState$$.next('settings');

    });

    this.updateMenu()
  }

  updateMenu() {
    const userLocalData = this.userService.getUserLocalData();
    if (!userLocalData) return;
    const user = JSON.parse(userLocalData);
    if (!user || !user?.permissionWindows) return;
    const permissions = user.permissionWindows;

    const permissionSet = new Set(permissions);

    this.mainMenuList = this.mainMenuList.filter(item => {
      if (item.permissions === undefined) return true;
      return [...item.permissions].some(val => permissionSet.has(val));
    });

    this._cdRef.detectChanges();
  }

  openRoute(item: any) {
    if (!item?.disabled)
      this.router.navigate([item.link])
  }
}
