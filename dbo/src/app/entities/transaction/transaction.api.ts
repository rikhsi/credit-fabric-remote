import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { BackendResponse } from "../../core/models/backend-response.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { SessionService } from "../../core/services/session.service";
import { OperDayResponse, PreparePaymentUzsTransactionResponse } from './transaction.model';
import { StringResponse } from '../../shared/models/string-response';

@Injectable({ providedIn: 'root' })
export class TransactionApi {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private API_URL = `${environment.API_BASE}`;

  getTransactionById(id: string): Observable<PreparePaymentUzsTransactionResponse | null> {
    return this.http.get<BackendResponse<PreparePaymentUzsTransactionResponse>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction`,
      { params: { id } }
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  getTransactionOperDay(): Observable<OperDayResponse | null> {
    return this.http.get<BackendResponse<OperDayResponse>>(
      `${this.API_URL}/api/core-transaction/v1/reference/request/get-oper-day`
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  deleteTransactions(transactionIds: string[]) {
    return this.http.post<BackendResponse<StringResponse>>(
      `${this.API_URL}/api/core-transaction/v1/payment/delete/transaction-list`,
      {ids: transactionIds}
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  getTransactionMainStatuses(status: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction/status/list/main`,
      { params: { status } }
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }
}
