import { Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
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
      this.mobileApp.sign(file);
    }
  }

  public getUserInfo(): void {
    if (this.mobileApp) {
      this.mobileApp.getUserInfo();

      console.log(this.mobileApp.getUserInfo());
    }
  }

  public initSignListener(): void {
    window.addEventListener('message', (event) => {
      console.log('postMessage:', event.data);
    });
  }
}
