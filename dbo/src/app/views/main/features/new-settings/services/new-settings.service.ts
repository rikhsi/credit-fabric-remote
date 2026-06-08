import {inject, Injectable, signal} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {SessionService} from "../../../../../core/services/session.service";
import {environment} from "../../../../../../environments/environment";
import {BehaviorSubject, catchError, map, Observable} from "rxjs";
import {BackendResponse} from "../../../../../core/models/backend-response.model";
import {
  BusinessInfo,
  NotificationCategoryDto,
  NotificationSilenceDto,
  RoleDto,
  SettingUserInfoDto,
  UsersDto
} from "../models/settings.model";
import {AccountPinListDto} from "../../accounts-payments/models/accounts-payments.model";
import {NewSessionService} from "./new-session.service";
import {UserInfoDto} from "../../../../../core/models/user.model";


@Injectable({
  providedIn: "root",
})
export class NewSettingsService {

  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);
  private _newSessionService = inject(NewSessionService);
  private API_URL = `${environment.API_BASE}`

  private refreshSource = new BehaviorSubject<boolean>(false);
  refresh$ = this.refreshSource.asObservable();

  userCreateDraft = signal<any | null>(null);

  constructor() {
    try {
    const saved = sessionStorage.getItem('userCreateDraft');
    if (saved) {
      this.userCreateDraft.set(JSON.parse(saved));
    }
  } catch (e) {}
  }

  setUserCreateDraft(data: any) {
    this.userCreateDraft.set(data);
    sessionStorage.setItem('userCreateDraft', JSON.stringify(data));

  }

  clearUserCreateDraft() {
    this.userCreateDraft.set(null);
    sessionStorage.removeItem('userCreateDraft');
  }

  confirmUserPasswordMyId(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/password/confirmByMyId`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  checkUserPasswordOtp(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/password/confirmByOtp`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  changeUserPassword(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/password/change`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  checkUserPassword(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/password/check`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getTrustedDeviceList(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/trusted-device/list`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deleteTrustedDevice(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/trusted-device/delete?uuid=${data.uuid}`, {}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deleteAllTrustedDevice(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/token/log-all-out`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  downloadOrganizationInfo(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/card`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  createUserAccount(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/create`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  signUserProcess(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/sign/create/qr/mobile-sign`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  signUserProcessCheck(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/sign/check/qr/mobile-sign`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getUserList(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/get/list?page=0&size=500`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getUserPermission(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/role/get-permission-module`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getNotApprovedUserList(data:{page:0, size: 500}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/get/application/list`,data ).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getUserRoleList(): Observable<RoleDto[] | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/role`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getUserInfo(data:{uuid: string}): Observable<SettingUserInfoDto | null> {
    return this._http.post<BackendResponse<SettingUserInfoDto>>(`${this.API_URL}/api/user/v1/business/user/get/one`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  changeUserRole(data:{cms: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/change/role`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  changeUserStatus(data:{uuid: string, status:string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/change/status`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteUser(data:{cms: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/delete`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  invitationResend(data:{businessUserUuid: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/resend/invitation`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deleteNotApprovedUser(data:{id: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/business/user/application/delete`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  changeUserEmail(data:{newEmail: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/email/change`, data, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  changeUserPhone(data:{newPhoneNumber: string, hash: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/phoneNumber/change`,data, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
        map(this._sessionService.handleResponse<any>),
        catchError(this._sessionService.handleError)
    );
  }
  getWebSession(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/myId/webSession`).pipe(
        map(this._sessionService.handleResponse<any>),
        catchError(this._sessionService.handleError)
    );
  }
  confirmUserEmail(data:{requestId: string, otpCode: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/email/confirm`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  resendUserEmailCode(data:{requestId: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/email/change/resend`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  resendUserPhoneCode(data:{requestId: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/phoneNumber/change/resend`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  resendUserPasswordCode(data:{id: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/password/change/resend`,data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  confirmUserPhone(data:{requestId: string, otpCode: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/user/phoneNumber/confirm`,data, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
        map(this._newSessionService.handleResponse<any>),
        catchError(this._newSessionService.handleError)
    );
  }
  getRouterList(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/sign-order/get/all`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  destinationCodes(data: {page: number, size: number, searchText: string}): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/purpose/all?purposeType=PAYMENT_UZS&page=${data.page}&size=${data.size}&searchText=${data.searchText}`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  // /api/account-transaction/v1/purpose/unpin
  unpinAccountTransactionPurpose(purposeCode: string) :Observable<any | null> {
      return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/purpose/unpin`,{purposeCode}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  // /api/account-transaction/v1/purpose/create/pin
    pinAccountTransactionPurpose(purposeCode: string) :Observable<any | null> {
      return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/purpose/create/pin`,{purposeCode}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  // /api/account/v2/bank-info/unpin

  unpinAccountBankInfo(bankInfoId: number) :Observable<any | null> {
      return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account/v2/bank-info/unpin`,{bankInfoId}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }

  pinAccountBankInfo(bankInfoId: number) :Observable<any | null> {
      return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account/v2/bank-info/create/pin`,{bankInfoId}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }

  getBankInfo(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account/v2/bank-info/search-bank-info`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  treasuryAccounts(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/support-info/v1/requisites/list`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  purposeTransfer(data): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/physical/card/purpose/types`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  attachSignOrder(data:{cms: string}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/sign-order/attach`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getBusinessInfo(): Observable<BusinessInfo | null> {
    return this._http.get<BackendResponse<BusinessInfo>>(`${this.API_URL}/api/user/v1/business/info`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getBusinessTariffs(): Observable<BusinessInfo | null> {
    return this._http.get<BackendResponse<BusinessInfo>>(`${this.API_URL}/api/tariff/v1/business/tariffs`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getAccountMainInfo(): Observable<BusinessInfo | null> {
    return this._http.get<BackendResponse<BusinessInfo>>(`${this.API_URL}/api/account/v1/get/main`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getUserSignatureList(): Observable<RoleDto[] | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/styx/business/certificate/get`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  getUserNotificationSettingsList(): Observable<NotificationCategoryDto[] | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user-settings`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }

  updateUserNotificationSettings(data:{categoryList: NotificationCategoryDto[]}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user-settings/update`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deletetUserNotificationSettings(): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user-settings/delete`, {}).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }

  getUserNotificationSilenceSettingsItem(): Observable<NotificationSilenceDto | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user/notification/silence/get`).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  setUserNotificationSilenceSettingsList(data: {from: string, to: string}): Observable<NotificationSilenceDto | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user/notification/silence`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  editUserNotificationSilenceSettings(data: {from?: string, to?: string, status?: string}): Observable<NotificationSilenceDto | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user/notification/silence/edit`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deleteNotificationItem(data): Observable<NotificationSilenceDto | null> {
    return this._http.put<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/delete`,data ).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  deleteAllNotificationItem(): Observable<NotificationSilenceDto | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/delete-all`, {} ).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  downloadPolicy(data: {documentType?: string}): Observable<Blob | null> {
    return this._http.get(`${this.API_URL}/api/file-upload/v1/download/policy`, {
      params: data,
      responseType: 'blob'
    });
  }
  downloadPolicyIframe(data: { type?: string }): Observable<string | null> {
    return this._http
      .post<BackendResponse<{ link: string }>>(
        `${this.API_URL}/api/user/v1/meta-link/get/one`,
        data,
      )
      .pipe(
        map((response) => {
          const handled = this._newSessionService.handleResponse<{ link: string }>(
            response,
          ) as BackendResponse<{ link: string }>;
          return handled?.result?.data?.link ?? null;
        }),
        catchError(this._newSessionService.handleError),
      );
  }
  setDefaultNotificationSettings(data: {}): Observable<NotificationSilenceDto | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/user-settings/default`, data).pipe(
      map(this._newSessionService.handleResponse<any>),
      catchError(this._newSessionService.handleError)
    );
  }
  triggerRefresh(): void {
    this.refreshSource.next(true);
  }
}
