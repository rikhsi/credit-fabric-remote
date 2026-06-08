import { Injectable, signal } from '@angular/core';
import { BridgeService } from './bridge.service';
import { UserItem } from '@api/models/base';
import { environment } from 'src/environments/development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserItem>(null);

  constructor(private bridgeService: BridgeService) {}

  public initHost(): void {
    const hostUser = this.bridgeService.getUserInfo();

    if (hostUser) {
      this.user.set(hostUser);
    } else {
      switch (environment.mode) {
        case 'testing':
          this.user.set(environment.user);
          break;
        case 'development':
          this.user.set(environment.user);
          break;
        default: {
          break;
        }
      }
    }

    this.bridgeService.initSignListener();
  }
}
