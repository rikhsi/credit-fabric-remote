import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, EMPTY, map, Observable} from 'rxjs';
import {BackendResponse} from 'src/app/core/models/backend-response.model';
import {UserDataDto, UserInfoDto, UserInfoDtoV2, VerifyIdentityResponse} from 'src/app/core/models/user.model';
import {SessionService} from 'src/app/core/services/session.service';
import {environment} from 'src/environments/environment';

import {TokenConfirmRequest, TokenInitResponse} from '../models/auth.model';
import {NotificationService} from "../../../core/services/notification.service";
import {UserService} from "../../../core/services/user.service";


export interface IBusiness {
  businessId: number;
  businessName: string;
}

export interface BusinessCheckDto {
  newUser: boolean;
  identityToken: string;
  businessList: IBusiness[]
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = `${environment.API_BASE}`;
  selectedLang = localStorage.getItem('langForBackend') || 'RUS';

  private constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
    protected userService:UserService
  ) {

  }

  initNewToken(sign: string, digest: string): Observable<TokenInitResponse | null> {
    return this._http.post<BackendResponse<TokenInitResponse>>(`${this.API_URL}/identity/auth/token/init-new`, {
      sign,
      digest
    }).pipe(
      map(this._sessionService.handleResponse<TokenInitResponse>)
    );
  }

  userCheck(phoneNumber: string): Observable<{ newUser: boolean, withKey: boolean } | null> {
    return this._http.get<BackendResponse<{
      newUser: boolean,
      withKey: boolean
    }>>(`${this.API_URL}/identity/auth/token/check?number=${phoneNumber}`).pipe(
      map(this._sessionService.handleResponse<{ newUser: boolean, withKey: boolean }>),
      catchError(this._sessionService.handleError)
    )
  }

  userCheckPhoneNumber(phoneNumber: string): Observable<BusinessCheckDto | null> {
    return this._http.post<BackendResponse<BusinessCheckDto>>(`${this.API_URL}/api/identity/v1/auth/sign/user/check`, {phoneNumber}).pipe(
      map(this._sessionService.handleResponseWithFullError<BusinessCheckDto>)
    )
  }

  userCheckLogin(body: {password?: string, identity: string, encPassword?: string}): Observable<BusinessCheckDto | null> {
    return this._http.post<BackendResponse<BusinessCheckDto>>(`${this.API_URL}/api/identity/v1/auth/sign/login`, body).pipe(
      map(this._sessionService.handleResponseWithFullError<BusinessCheckDto>)
    )
  }

  userAnotherType(identity: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/another/type`, {
      identity
    }).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  userForgotAlternative(identity: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/forgot/password/alternative`, {
      identity
    }).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }

  userCheckTypes(identity: string, type: string): Observable<BusinessCheckDto | null> {
    return this._http.post<BackendResponse<BusinessCheckDto>>(`${this.API_URL}/api/identity/v1/auth/sign/select/type`, {
      identity,
      type
    }).pipe(
      map(this._sessionService.handleResponse<BusinessCheckDto>)
    )
  }

  getUserBusiness(username: string, password: string): Observable<BusinessCheckDto | null> {
    return this._http.post<BackendResponse<BusinessCheckDto>>(`${this.API_URL}/api/identity/v1/auth/token/login`, {
      username,
      password
    }, {headers: {'X-DEVICE-TYPE': 'web'}}).pipe(
      map(this._sessionService.handleResponse<BusinessCheckDto>)
    )
  }

  refreshToken(body: { accessToken: string, refreshToken: string }): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/token/refresh-token`, body, {headers: {'X-DEVICE-TYPE': 'web', 'X-Lang': this.selectedLang ==='CHN' ? "RUS" : this.selectedLang}})
      .pipe(
      map(this._sessionService.handleResponse<any>),
       catchError((err) => {
         this.userService.logout()
          return EMPTY
        })

    )
  }

  verifyCode(code: string, identityToken: string, businessId: number): Observable<UserDataDto | null> {
    return this._http.post<BackendResponse<UserDataDto>>(`${this.API_URL}/identity/auth/token/sign-in/passive`, {
      code,
      identityToken,
      businessId
    })
      .pipe(
        map(this._sessionService.handleResponse<UserDataDto>)
      )
  }

  loginConfirm(data: {identity: string, code?: string, hash?: string}): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/login-confirm`, data)
      .pipe(
        map(this._sessionService.handleResponseWithFullError<any>)
      )
  }


  verifySms(data: {otpCode: string, identity: string}): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/confirm/otp`, data)
      .pipe(
        map(this._sessionService.handleResponseWithFullError<any>)
      )
  }

  resendCode(id: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/login/resend`, {id})
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }
  resendUserCode(id: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/user/resend`, {id})
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }

  setPassword(data: {encConfirmPassword: string, identity: string, encPassword: string}): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/create/password`, data)
      .pipe(
        map(this._sessionService.handleResponseWithFullError<any>)
      )
  }

  verifySmsCode(code: string, identityToken: string): Observable<UserDataDto | null> {
    return this._http.post<BackendResponse<UserDataDto>>(`${this.API_URL}/api/identity/v1/auth/token/login-confirm`, {
        code,
        identityToken,
      },
      {headers: {'X-DEVICE-TYPE': 'web'}},
    )
      .pipe(
        map(this._sessionService.handleResponse<UserDataDto>)
      )
  }


  verifyMyId(data: { hash: string, identity: string }): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/confirm/myId`, data,
      {headers: {'X-DEVICE-TYPE': 'web'}},
    )
      .pipe(
        map(this._sessionService.handleResponseWithFullError<UserDataDto>)
      )
  }

  verifyEsp(sign: string, digest: string, identityToken: string, businessId: number): Observable<UserDataDto | null> {
    return this._http.post<BackendResponse<UserDataDto>>(`${this.API_URL}/identity/auth/token/sign-in`, {
      sign,
      digest,
      identityToken,
      businessId
    })
      .pipe(
        map(this._sessionService.handleResponse<UserDataDto>)
      )
  }


  codeCheck(phoneNumber: string, code: string): Observable<{ newUser: boolean, withKey: boolean } | null> {
    return this._http
      .post<BackendResponse<{
        newUser: boolean,
        withKey: boolean
      }>>(`${this.API_URL}/identity/auth/token/init-new/passive-user`, {
        smsCode: code,
        username: phoneNumber
      })
      .pipe(map(this._sessionService.handleResponse<{ newUser: boolean, withKey: boolean }>),
        catchError(this._sessionService.handleError)
      )
  }

  confirmNewToken(tokenConfirmBody: TokenConfirmRequest): Observable<UserDataDto | null> {
    return this._http.post<BackendResponse<UserDataDto>>(`${this.API_URL}/identity/auth/token/init-new/confirm`, {...tokenConfirmBody})
      .pipe(
        map(this._sessionService.handleResponse<UserDataDto>),
        catchError(this._sessionService.handleError)
      );
  }

  verifyIdentity(body: TokenConfirmRequest): Observable<VerifyIdentityResponse | null> {
    return this._http.post<BackendResponse<VerifyIdentityResponse>>(`${this.API_URL}/identity/auth/token/verify`, body)
      .pipe(
        map(this._sessionService.handleResponse<VerifyIdentityResponse>),
        catchError(this._sessionService.handleError),
      );
  }

  verifyIdentityV2(body: TokenConfirmRequest): Observable<VerifyIdentityResponse | null> {
    return this._http.post<BackendResponse<VerifyIdentityResponse>>(`${this.API_URL}/api/identity/v1/auth/token/login-confirm`, body)
      .pipe(
        map(this._sessionService.handleResponse<VerifyIdentityResponse>),
        catchError(this._sessionService.handleError),
      );
  }

  verifyBussiness(body: TokenConfirmRequest): Observable<VerifyIdentityResponse | null> {
    return this._http.post<BackendResponse<VerifyIdentityResponse>>(`${this.API_URL}/api/identity/v1/auth/sign/business-init`, body)
      .pipe(
        map(this._sessionService.handleResponse<VerifyIdentityResponse>),
        catchError(this._sessionService.handleError),
      );
  }
  forgotPassword(data: {identity: string}): Observable<VerifyIdentityResponse | null> {
    return this._http.post<BackendResponse<VerifyIdentityResponse>>(`${this.API_URL}/api/identity/v1/auth/sign/forgot/password`, data)
      .pipe(
        map(this._sessionService.handleResponse<VerifyIdentityResponse>),
        catchError(this._sessionService.handleError),
      );
  }


  getAllBusiness(): Observable<any> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/all`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  businessInit(businessId: number): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/init`, {businessId})
      .pipe(
        map(this._sessionService.handleResponse<any>),
        catchError(this._sessionService.handleError),
      );
  }

  getUserInfo(): Observable<UserInfoDto | null> {
    return this._http.get<BackendResponse<UserInfoDto>>(`${this.API_URL}/api/user/v1/user/account/me`).pipe(
      map(this._sessionService.handleResponse<UserInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getUserInfoV2(): Observable<UserInfoDto | null> {
    return this._http.get<BackendResponse<UserInfoDto>>(`${this.API_URL}/api/user/v1/business/info`).pipe(
      map(this._sessionService.handleResponse<UserInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getUserByRole(roles: string[], page: number = 0, size: number = 20): Observable<any> {
    let q = `?page=${page}&size=${size}`;
    if (roles.length) {
      q += `&roles=${roles.toString()}`;
    }
    return this._http.get<BackendResponse<UserInfoDto>>(`${this.API_URL}/core/user/get/user-by-role${q}`).pipe(
      map(this._sessionService.handleResponse<UserInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }

  saveUserSettings(widget: any) {
    return this._http.post<BackendResponse<UserDataDto>>(`${this.API_URL}/core/settings/user-settings`, {
      widget
    })
      .pipe(map(this._sessionService.handleResponse<UserDataDto>)
      );
  }

  getUserSettings(): Observable<any> {
    return this._http.get<BackendResponse<UserInfoDto>>(`${this.API_URL}/core/settings/get-widget`).pipe(
      map(this._sessionService.handleResponse<UserInfoDto>)
    );
  }

}
