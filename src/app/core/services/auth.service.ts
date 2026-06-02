import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from './local-storage.service';
import { AuthSignInResult, UserItem } from '@api/models/base';
import { environment } from 'src/environments/development';
import { LocalStorageItem } from '@app/constants/local-storage';
import { RootRoute } from '@app/constants/route-path';

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
    private router: Router,
  ) {}

  public login({ accessToken, refreshToken }: AuthSignInResult): void {
    this.lsService.setItem(LocalStorageItem.AccessToken, accessToken);
    this.lsService.setItem(LocalStorageItem.RefreshToken, refreshToken);

    this.router.navigate([RootRoute.Loan], { replaceUrl: true });
  }

  public logout(withNavigate: boolean = true): void {
    this.lsService.removeItem(LocalStorageItem.AccessToken);
    this.lsService.removeItem(LocalStorageItem.RefreshToken);

    if (withNavigate) {
      this.router.navigate([RootRoute.Auth], { replaceUrl: true });
    }
  }

  private checkValidity(token: string): boolean {
    if (environment.skipAuth) return true;

    if (!token) return false;

    try {
      return !this.jwtService.isTokenExpired(token);
    } catch (e) {
      return false;
    }
  }
}
