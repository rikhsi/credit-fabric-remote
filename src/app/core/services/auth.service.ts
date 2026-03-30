import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { JwtHelperService } from '@auth0/angular-jwt';
import { filter, Observable, tap } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageItem, LOGOUT_MODAL_DATA } from '@constants';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@typings';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<unknown>(null);

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

  public login({ accessToken, refreshToken }: NzSafeAny): void {
   
  }

  public logout(withNavigate: boolean = true): void {
   
  }

  public logout$(): Observable<boolean> {
    return this.nmService
      .create<ModalConfirmComponent, ConfirmModal, boolean>({
        ...LOGOUT_MODAL_DATA,
        nzContent: ModalConfirmComponent,
        nzData: {
          title: 'modal.logout.title',
          description: 'modal.logout.desc',
          cancel: { title: 'action.cancel', danger: false },
          submit: { title: 'action.submit', danger: false },
        },
      })
      .afterClose.pipe(
        filter((state) => state),
        tap(() => this.logout()),
      );
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
