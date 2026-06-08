import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, throwError } from 'rxjs';

import {BackendResponse} from "../../../../../core/models/backend-response.model";
import {UserService} from "../../../../../core/services/user.service";
import {UtilsService} from "../../../../../core/services/utils.service";
import {FirebaseAnalyticsService} from "../../../../../../../firebase-analytics.service";
import {Router} from "@angular/router";
import { getAuthFlowId, getHashedBusinessId, getUserId } from 'src/app/core/utils/uuid.util';
@Injectable({
  providedIn: 'root',
})
export class NewSessionService {
  constructor(
    private toastrService: ToastrService,
    private _userService: UserService,
    private utilsService: UtilsService,
    private analyticsService: FirebaseAnalyticsService,
    private router: Router
  ) {}

  handleResponse = <T = any>(response: BackendResponse<T>): T | BackendResponse<T> => {

    if (!response?.success) {
      if (response?.result?.actionType === 'LOGOUT') {
           // this._userService.logout()
        // console.log("New session successfully")
      }
      if (response?.result?.actionType === 'PERMISSION_DENIED') {
        const errMessage = (response?.result?.message || response?.error?.message || 'Что то пошло не так...') as string;
        this.toastrService.error(errMessage, `Ошибка`);
        return response;
      }

      localStorage.setItem('actionType', response.result.actionType)
      const errMessage = (response?.result?.message || response?.error?.message || 'Что то пошло не так...') as string;
      throw new Error(errMessage);
    }

    this.utilsService.spinnerState$$.next(false);
    return response;
  };


handleError = (err: HttpErrorResponse & { userMessage?: string,requestMethod?: string }): Observable<never> => {

    console.error('😎😎😎😎😎😎😎HTTP Error NEW SESSION:', err);
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

    const backendMessage = err.userMessage ||
      err?.error?.result?.message ||
      err?.error?.message ||
      err?.message ||
      'Произошла ошибка при запросе к серверу.';
   if (backendMessage) {
     this.toastrService.error(backendMessage, `Ошибка ${err.status ?? ''}`);
   }

   this.utilsService.spinnerState$$.next(false);

    return throwError(() => err);
  };
}
