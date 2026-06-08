import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, take } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import {
  ClientDecisionRequest,
  PasswordChange, SignActionRequest,
  SignApplicationRequest,
  SignConfirmRequest,
  SignConfirmResponse,
  SignRequest
} from '../models/transaction.models';
import { ToastrService } from 'ngx-toastr';



@Injectable({
  providedIn: 'root',
})
export class EspSignConfirmService {
  private API_URL = `${environment.API_BASE}`;

  devModeSubject = new BehaviorSubject(false);


  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
  ) {}

  paymentSign(payload: SignRequest): Observable<{ additional: string, externalId: string } | null> {
    return this._http.post<BackendResponse<{ additional: string, externalId: string }>>(`${this.API_URL}/core/sign/sign`, payload).pipe(
      map(this._sessionService.handleResponse<{ additional: string, externalId: string }>)
    )
  }

  toggleDevMode() {
    this.devModeSubject.pipe(take(1))
      .subscribe((res) => {
        this.devModeSubject.next(!res);
        if(!res) {
          this.toastrService.info('Dev Mode Active');
        } else {
          this.toastrService.info('Dev Mode Canceled');
        }
      })
  }

  paymentSignApplication(payload: SignApplicationRequest): Observable<{ message: string } | null> {
    return this._http.post<BackendResponse<{ message: string }>>(`${this.API_URL}/core/sign/sign-application`, payload).pipe(
      map(this._sessionService.handleResponse<{ message: string }>)
    )
  }

  signApplication(payload: any): Observable<{ message: string } | null> {
    return this._http.post<BackendResponse<{ message: string }>>(`${this.API_URL}/core/sign/accept-application`, payload).pipe(
      map(this._sessionService.handleResponse<{ message: string }>)
    )
  }

  paymentSignConfirm(payload: SignConfirmRequest): Observable<any> {
    return this._http.post<BackendResponse<SignConfirmResponse>>(`${this.API_URL}/core/sign/confirm`, payload).pipe(
      map(this._sessionService.handleResponse<SignConfirmResponse>)
    )
  }

  paymentSignAction(payload: SignActionRequest): Observable<any> {
    return this._http.post<BackendResponse<SignConfirmResponse>>(`${this.API_URL}/api/core-transaction/v1/sign/action`, payload).pipe(
      map(this._sessionService.handleResponse<SignConfirmResponse>)
    )
  }

  paymentSignAllAction(sign:string): Observable<any> {
    return this._http.post<BackendResponse<SignConfirmResponse>>(`${this.API_URL}/api/core-transaction/v1/sign/action/file`, {sign}).pipe(
      map(this._sessionService.handleResponse<SignConfirmResponse>)
    )
  }

  paymentCheckETSP(payload: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/payment/check/sign`, payload).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  paymentCheckETSPAuth(payload: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/ecp/check`, payload).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  passwordChangeConfirm(payload: PasswordChange): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/user/password/change`, payload).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }
  loanRequestConfirm(payload: {digest:string,sign:string}): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/credit/client-decision`, payload).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    )
  }
  styxSaveList(payload: {certificates:any,identityToken:string | null}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/styx/certificate/save/list`, payload).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }
  getPinflForStyx(): Observable<any | null> {
    return this._http.get<any>(`${this.API_URL}/api/identity/v1/user/get/pinfl`).pipe(catchError(this._sessionService.handleError)
    )
  }
}
