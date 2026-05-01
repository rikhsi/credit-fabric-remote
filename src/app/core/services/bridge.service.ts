import { inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  notificationService = inject(NzNotificationService);

  private get windowRef() {
    return window as NzSafeAny;
  }

  private get mobileApp() {
    return this.windowRef?.MobileApp;
  }

  public onCloseClick(): void {
    if (this.mobileApp) {
      this.mobileApp.close();
    }
  }

  public onSignClick(file: string): void {
    if (this.mobileApp) {
      this.mobileApp.signBase64File(file);
    }
  }

  public getUserInfo(): void {
    if (this.mobileApp) {
      const raw = this.mobileApp.getUserInfo();

      try {
        const parsed = JSON.parse(raw);

        this.notificationService.success('success', JSON.stringify(parsed, null, 2));
      } catch (error: NzSafeAny) {
        this.notificationService.error('JSON parse error', `Ошибка: ${error?.message}\n\nRaw: ${raw}`);
      }
    }
  }

  public initSignListener(): void {
    window.addEventListener('message', (event) => {
      this.notificationService.success('success', event.data);
    });
  }
}
