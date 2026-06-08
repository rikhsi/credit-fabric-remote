import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { BackendResponse } from "../../core/models/backend-response.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { SessionService } from "../../core/services/session.service";
import {
  AccountInfoResponse,
  AccountsPageResponse,
  DocNumResponse,
  GetAllowedAccountsRequest,
  ListDictionaryResponse
} from "./account.model";

@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private API_URL = `${environment.API_BASE}`;

  getAllowedPaymentAccounts(body: GetAllowedAccountsRequest) {
    return this.http.post<BackendResponse<AccountsPageResponse>>(
      `${this.API_URL}/api/account-transaction/v1/check-payment/get-payment-allowed`, body
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError),
    );
  }

  getAccountInfo(accountNumber: string): Observable<AccountInfoResponse | null> {
    return this.http.get<BackendResponse<AccountInfoResponse>>(
      `${this.API_URL}/api/account/v1/get/info?accountNumber=${accountNumber}`
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  getAccountTransactionDocNum(): Observable<DocNumResponse | null> {
    return this.http.get<BackendResponse<DocNumResponse>>(`${this.API_URL}/api/account-transaction/v1/payment/get/doc-number`).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  getAccountTransactionSalaryPurposeCode(): Observable<ListDictionaryResponse | null> {
    return this.http.get<BackendResponse<ListDictionaryResponse>>(`${this.API_URL}/api/account-transaction/v1/dictionary/salary-purpose-code`).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }
}
