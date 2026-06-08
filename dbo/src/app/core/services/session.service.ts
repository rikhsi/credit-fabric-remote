import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';

import {BackendResponse} from '../models/backend-response.model';
import {UserService} from './user.service';
import {UtilsService} from './utils.service';
import {Router} from "@angular/router";
import {FirebaseAnalyticsService} from "../../../../firebase-analytics.service";
import { getAuthFlowId, getHashedBusinessId, getUserId } from '../utils';

@Injectable({
  providedIn: 'root',
})

export class SessionService {
  constructor(
    private toastrService: ToastrService,
    private _userService: UserService,
    private utilsService: UtilsService,
    private router: Router,
    private analyticsService: FirebaseAnalyticsService,
  ) {}

  handleResponse = <T>(response: BackendResponse<T>): T => {
    if (!response?.success) {
      if (response.result.actionType === 'RETURN_SIGN_FIRST_STEP') {
        this.router.navigate(['/auth']);
        window.location.reload();
      }
      localStorage.setItem('actionType', response.result.actionType)

      const errMessage = (response?.result?.message || response?.error?.message || 'Что то пошло не так...') as string;
      throw new Error(errMessage);
    }

    // if (response.result.actionType === "SUCCESS") {
    //   this.router.navigate(['/payment']);
    // }
    this.utilsService.spinnerState$$.next(false);
    return response.result.data;
  };

    handleResponseWithFullError = <T>(response: BackendResponse<T>): T => {
    if (!response?.success) {
      if (response.result.actionType === 'RETURN_SIGN_FIRST_STEP') {
        this.router.navigate(['/auth']);
        window.location.reload();
      }
      localStorage.setItem('actionType', response.result.actionType)

      const errMessage = (response?.result?.message || response?.error?.message || 'Что то пошло не так...') as string;
      throw response.result;
    }

    this.utilsService.spinnerState$$.next(false);
    return response.result.data;
  };

  handleResponseResult = <T>(response: BackendResponse<T>): T => {
    if (!response?.success) {
      if (response.result.actionType === 'RETURN_SIGN_FIRST_STEP') {
        this.router.navigate(['/auth']);
        window.location.reload();
      }
      localStorage.setItem('actionType', response.result.actionType)

      throw (response?.result?.message || response?.error?.message || 'Что то пошло не так...') as string;
    }

    // if (response.result.actionType === "SUCCESS") {
    //   this.router.navigate(['/payment']);
    // }
    this.utilsService.spinnerState$$.next(false);
    return response.result.data;
  };

  handleError =  (err: HttpErrorResponse & { userMessage?: string,requestMethod?: string }): Observable<null> => {
    const { message } = err;
   this.analyticsService.logFirebaseCustomEvent('api_error', {
    api_path: err.url ? new URL(err.url).pathname : undefined,
    flow_type: this.router.url?.startsWith('/auth') ? 'authorization' : 'authenticated',
    http_status: err.status,
    error_source: err.status === 0 ? 'network' : 'backend',
    error_type: err.status === 0 ? 'no_connection' : 'api_error',
    result: 'error',
    error_code: err.status,
    auth_flow_id:getAuthFlowId(),
    user_id:getUserId(),
    business_id:getHashedBusinessId(),
    request_method:err?.requestMethod,
    error_message: err.message || err?.error?.result?.message || err?.message,
  });

    if (Array.isArray(message)) message.forEach(message => this.toastrService.error(message));
    // else this.toastrService.error(message);
    this.utilsService.spinnerState$$.next(false);
    return of(null);
  }
}
