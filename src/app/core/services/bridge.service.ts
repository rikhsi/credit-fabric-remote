import { inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/development';
import { UserItem } from '@api/models/base';
import { NativeEvent } from '@app/typings/bridge';
import { TokenRefreshService } from '@core/services/token-refresh.service';
import { normalizePhoneNumber } from '@shared/utils/phone';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  notificationService = inject(NzNotificationService);
  private tokenRefreshService = inject(TokenRefreshService);

  private listenerInitialized = false;

  private get windowRef() {
    return window as NzSafeAny;
  }

  private get bridge() {
    return this.windowRef?.Bridge;
  }

  public hasBridge(): boolean {
    return Boolean(this.bridge);
  }

  public onCloseClick(): void {
    if (this.bridge) {
      this.bridge.close();
    }
  }

  public onSignClick(file: string): void {
    if (this.bridge) {
      this.bridge.signBase64File(file, environment.projectTag);
    }
  }

  public refreshToken(): void {
    if (this.bridge) {
      this.bridge.onTokenExpired();
    }
  }

  public getUserInfo(): UserItem | null {
    if (this.bridge) {
      const raw = this.bridge.getUserInfo();

      try {
        const parsed = JSON.parse(raw) as UserItem;

        return {
          ...parsed,
          phone: normalizePhoneNumber(parsed.phone),
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  public initSignListener(): void {
    if (this.listenerInitialized) {
      return;
    }

    this.listenerInitialized = true;
    window.addEventListener('message', this.onWindowMessage);
  }

  private readonly onWindowMessage = (event: MessageEvent<NativeEvent<NzSafeAny>>): void => {
    const payload = event.data;

    if (payload?.event !== environment.projectTag) {
      return;
    }

    const eventName = payload.data?.event_name;

    if (eventName === 'onTokenRefresh') {
      this.tokenRefreshService.completeRefresh(payload.data?.status === 'success');
      return;
    }

    if (eventName === 'onChangeTheme') {
      this.notificationService.success(payload.event, payload.data.event_name);
      return;
    }

    this.notificationService.success(payload.event, payload.data.event_name);
  };
}
