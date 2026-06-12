import { inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/development';
import { UserItem } from '@api/models/base';
import { NativeEvent } from '@app/typings/bridge';

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
      this.mobileApp.signBase64File(file, environment.projectTag);
    }
  }

  public getUserInfo(): UserItem {
    if (this.mobileApp) {
      const raw = this.mobileApp.getUserInfo();

      try {
        const parsed = JSON.parse(raw);

        return parsed;
      } catch (error: NzSafeAny) {}

      return null;
    }

    return null;
  }

  public initSignListener(): void {
    window.addEventListener('message', (event: MessageEvent<NativeEvent<string>>) => {
      this.notificationService.success(event.data.event, event.data.data.event_name);
    });
  }
}
