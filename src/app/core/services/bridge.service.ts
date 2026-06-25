import { inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/development';
import { UserItem } from '@api/models/base';
import { NativeEvent } from '@app/typings/bridge';
import { normalizePhoneNumber } from '@shared/utils/phone';

const TOKEN_REFRESH_TIMEOUT_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  notificationService = inject(NzNotificationService);

  private listenerInitialized = false;
  private refreshPromise: Promise<boolean> | null = null;
  private resolveRefresh: ((success: boolean) => void) | null = null;
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

  public setToken(): void {
    if (this.bridge) {
      this.bridge.onTokenExpired();
    }
  }

  public refreshToken(): Promise<boolean> {
    if (!this.hasBridge()) {
      return Promise.resolve(false);
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = new Promise<boolean>((resolve) => {
      this.resolveRefresh = resolve;
      this.setToken();

      this.refreshTimeoutId = setTimeout(() => {
        this.completeTokenRefresh(false);
      }, TOKEN_REFRESH_TIMEOUT_MS);
    });

    return this.refreshPromise;
  }

  public getUserInfo(): UserItem {
    if (this.bridge) {
      const raw = this.bridge.getUserInfo();

      try {
        const parsed = JSON.parse(raw) as UserItem;

        console.log(parsed);

        return {
          ...parsed,
          phone: normalizePhoneNumber(parsed.phone),
        };
      } catch (error: NzSafeAny) {}

      return null;
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
    console.log(event);
    const payload = event.data;

    if (payload?.event !== environment.projectTag) {
      return;
    }

    const eventName = payload.data?.event_name;

    if (eventName === 'tokenRefreshed') {
      this.completeTokenRefresh(payload.data?.status === 'success');
      return;
    }

    if (eventName === 'onChangeTheme') {
      this.notificationService.success(payload.event, payload.data.event_name);
    }

    this.notificationService.success(payload.event, payload.data.event_name);
  };

  private completeTokenRefresh(success: boolean): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.resolveRefresh?.(success);
    this.resolveRefresh = null;
    this.refreshPromise = null;
  }
}
