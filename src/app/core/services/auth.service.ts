import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from './local-storage.service';
import { AuthSignInResult, UserItem } from '@api/models/base';
import { LocalStorageItem, RootRoute } from '@constants';
import { environment } from 'src/environments/development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserItem>(null);

  get token() {
    return this.lsService.getItem(LocalStorageItem.AccessToken) as string;
  }

  get isAuthenticated() {
    return this.checkValidity(this.token);
  }

  constructor(
    private lsService: LocalStorageService,
    private jwtService: JwtHelperService,
    private nmService: NzModalService,
    private router: Router,
  ) {}

  public login({ accessToken, refreshToken }: AuthSignInResult): void {
    this.user.set(null);
    this.lsService.setItem(LocalStorageItem.AccessToken, accessToken);
    this.lsService.setItem(LocalStorageItem.RefreshToken, refreshToken);

    this.router.navigate([RootRoute.Loan], { replaceUrl: true });
  }

  public logout(withNavigate: boolean = true): void {
    this.user.set({
      pinfl: environment.user.pinfl,
      phone_nubmer: environment.user.phoneNumber,
    });
    this.lsService.removeItem(LocalStorageItem.AccessToken);
    this.lsService.removeItem(LocalStorageItem.RefreshToken);

    if (withNavigate) {
      this.router.navigate([RootRoute.Auth], { replaceUrl: true });
    }
  }

  private checkValidity(token: string): boolean {
    if (!token) return false;

    try {
      return !this.jwtService.isTokenExpired(token);
    } catch (e) {
      return false;
    }
  }
}
