import { inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/development';
import { UserItem } from '@api/models/base';
import { NativeEvent, NativeEventData, NativeEventName, NativeSignedData } from '@app/typings/bridge';
import { TokenRefreshService } from '@core/services/token-refresh.service';
import { ToastService } from '@core/services/toast.service';
import { normalizePhoneNumber } from '@shared/utils/phone';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  private readonly toast = inject(ToastService);
  private readonly tokenRefreshService = inject(TokenRefreshService);

  private readonly signedSubject = new Subject<NativeEventData<NativeSignedData>>();
  /** Emits once native finishes (or fails) signing started by `onSignClick`. */
  public readonly signed$: Observable<NativeEventData<NativeSignedData>> = this.signedSubject.asObservable();

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

        console.log(parsed);

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

    if (eventName === NativeEventName.TokenRefresh) {
      this.tokenRefreshService.completeRefresh(isTokenRefreshSuccess(payload.data?.status));
      return;
    }

    if (eventName === NativeEventName.Signed) {
      this.signedSubject.next(payload.data as NativeEventData<NativeSignedData>);
      return;
    }

    if (eventName === NativeEventName.ChangeTheme) {
      this.toast.success(payload.event, payload.data.event_name);
      return;
    }

    this.toast.success(payload.event, payload.data.event_name);
  };
}

function isTokenRefreshSuccess(status: unknown): boolean {
  if (status == null || status === '') {
    return true;
  }

  if (typeof status === 'boolean') {
    return status;
  }

  const normalized = String(status).trim().toLowerCase();

  return normalized === 'success' || normalized === 'ok' || normalized === 'true';
}
