import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { UserDataDto, UserInfoDto } from '../models/user.model';

import {UtilsService} from "./utils.service";
import {FirebaseAnalyticsService, UserProperties} from "../../../../firebase-analytics.service";
import { removeAuthFlowId, removeUserDataAfterUserCheck } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userLoginData$$ = new BehaviorSubject<UserDataDto | null>(null);
  userInfo$$ = new BehaviorSubject<UserInfoDto | null>(null);
  userLoginData$ = this.userLoginData$$.asObservable();
  userInfo$ = this.userInfo$$.asObservable();
  director$$ = new BehaviorSubject(null);
  headOfFinance$$ = new BehaviorSubject(null);

  logout$$ = new Subject<string>();

  constructor(
    private _router: Router,
    private utilService:UtilsService,
    private analyticsService: FirebaseAnalyticsService,
    ) {}


  setUserData(data: UserDataDto | null, changeBusiness: boolean = false) {
  this.userLoginData$$.next(data);
  console.log('ALLOOOOOOOOOOOOOO setUserData data',data)
  console.log('BBBBBBBBBBBBBBBBBBB  setUserData changeBusiness',changeBusiness)
  if(data?.hashedBusinessId) {
    removeAuthFlowId()
    let obj:UserProperties = {
      'business_id':data?.hashedBusinessId,
      'auth_flow_id':null
    }
    if(data.role.length) {
      obj.role =data?.role[0].name
    }

    this.analyticsService.setUserProperties(obj)
  }
  if (!data) return;
    if (!changeBusiness) {
      this.setToken(data.accessToken);
    }
  if (data.refreshToken) {
    this.setRefreshToken(data.refreshToken);
  }
    this.setPermissions(data.permissionModules)
  this.setUserLocalData(data);

  if (!changeBusiness) {
    this._router.navigate(['main']);
  }

}

  hasAction(moduleName: string): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;

    const module = JSON.parse(permissions).find(p => p.module === moduleName);
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  canSign(moduleName: string): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;

    const module = JSON.parse(permissions).find(p => p.module === moduleName);
    if (module) {
      return module.types.includes('SIGN')
    }
    return false
  }


  getRefreshTokenReq() {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
  }

  setToken = (token: string): void => {
    localStorage.setItem('token', token);
  };
  setRefreshToken = (token: string): void => {
    localStorage.setItem('refreshToken', token);
  };

  setPermissions = (permissions: any) => {
    localStorage.setItem('permissions', JSON.stringify(permissions))
  }

  getPermissions (): string | null {
    return localStorage.getItem('permissions') || null
  }

  getToken(): string | null {
    return localStorage.getItem('token') || null;
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || null;
  }

  setUserLocalData(data: UserDataDto): void {
    localStorage.setItem('user', JSON.stringify(data));
  }

  getUserLocalData(): string | null {
    return localStorage.getItem('user') || null;
  }

  logout() {
    removeUserDataAfterUserCheck()
    this.analyticsService.clearUserProperties();
    // this.analyticsService.deleteUserFirebaseCustomEvent()
    // this.analyticsService.deleteUserPropertiesFirebaseCustomEvent()
    this.analyticsService.logFirebaseCustomEvent('logout', null)

    this.userLoginData$$.next(null);
    const fcmToken = localStorage.getItem('x-fcm-token');
    this.logout$$.next(fcmToken || '');
    localStorage.removeItem('token');
    localStorage.removeItem('x-fcm-token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken')
    this.utilService.menuState$$.next('main')
    this._router.navigate(['/auth']).then(() => {
      window.location.reload();
    });
  }
}
