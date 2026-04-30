import { Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  public get windowRef() {
    return window as NzSafeAny;
  }

  public onCloseClick(): void {
    if (this.windowRef.MobileApp) {
      this.windowRef.MobileApp.close();
    }
  }

  public onSignClick(file: string): void {
    if (this.windowRef.MobileApp) {
      this.windowRef.MobileApp.sign(file);
    }
  }

  public getUserInfo(): void {
    if (this.windowRef.MobileApp) {
      this.windowRef.MobileApp.getUserInfo();

      console.log(this.windowRef.MobileApp.getUserInfo());
    }
  }

  public initBridgeListeners(): void {
    this.windowRef.setSign = (data: string) => {
      console.log('setSign called from Android:', data);

      // тут уже можешь делать что хочешь
      // например пробросить в Subject / signal
      this.handleSign(data);
    };
  }

  private handleSign(data: NzSafeAny) {}
}
