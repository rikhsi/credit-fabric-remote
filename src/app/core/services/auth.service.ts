import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BridgeService } from './bridge.service';
import { ThemeService } from './theme.service';
import { UserItem } from '@api/models/base';
import { mapBridgeThemeToAppTheme, Theme } from '@app/constants/theme';
import { environment } from 'src/environments/development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserItem>(null);

  private readonly bridgeService = inject(BridgeService);
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  public initHost(): Observable<Theme> | void {
    const hostUser = this.bridgeService.getUserInfo();

    if (hostUser) {
      this.user.set(hostUser);
    } else {
      switch (environment.mode) {
        case 'testing':
        case 'development':
          this.user.set(environment.user);
          break;
      }
    }

    this.bridgeService.initSignListener();

    if (!hostUser?.theme) {
      return;
    }

    const appTheme = mapBridgeThemeToAppTheme(hostUser.theme, this.document);

    if (!appTheme) {
      return;
    }

    return this.themeService.setTheme(appTheme);
  }
}
