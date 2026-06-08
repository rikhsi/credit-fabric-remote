import { inject, Injectable } from "@angular/core";
import { catchError, map } from "rxjs";
import { BackendResponse } from "../../core/models/backend-response.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { SessionService } from "../../core/services/session.service";
import {
  PrepareSalaryCardTransactionReq,
  PrepareSalaryCardTransactionRes,
  SalaryCardByTransactionIdRes,
  SalaryCardsByFileParseQueryReq,
  SalaryCardsByFileParseRes,
  SalaryCardsReq,
  SalaryCardsRes,
} from "./salary.model";
import { StringResponse } from '../../shared/models/string-response';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SalaryApi {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);
  private readonly toastrService = inject(ToastrService);


  private API_URL = `${environment.API_BASE}`;

  getEmployeesByTransactionId(transactionUuid: string) {
    return this.http.get<BackendResponse<SalaryCardByTransactionIdRes[]>>(
      `${this.API_URL}/api/salary-card/v1/salary/all/get/employee/by/transaction`,
      { params: { mode: 'SALARY', transactionUuid } }
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  getEmployeesByFileUpload(formData: FormData, query: SalaryCardsByFileParseQueryReq) {
    const params = new HttpParams({ fromObject: query });

    return this.http.post<BackendResponse<SalaryCardsByFileParseRes>>(
      `${this.API_URL}/api/salary-card/v1/salary/all/parse/file/upload`, formData, { params }
    ).pipe(
      map(res => {
        if (!res.success || res.result.actionType === 'ERROR') {
          this.toastrService.error(res.result.message as string);
        }
        return this.sessionService.handleResponse(res);
      }),
      catchError(this.sessionService.handleError)
    );
  }

  getEmployeesAll(body: SalaryCardsReq) {
    return this.http.post<BackendResponse<SalaryCardsRes>>(
      `${this.API_URL}/api/salary-card/v1/card/all`, body
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  generateSalaryCardsFile(body: SalaryCardsReq) {
    return this.http.post<BackendResponse<StringResponse>>(
      `${this.API_URL}/api/salary-card/v1/card/all/generate/file`, body
    ).pipe(
      map(res => this.sessionService.handleResponse(res)),
      catchError(this.sessionService.handleError)
    );
  }

  prepareSalaryCardTransaction(body: PrepareSalaryCardTransactionReq) {
    return this.http.post<BackendResponse<PrepareSalaryCardTransactionRes>>(`${this.API_URL}/api/salary-card/v1/salary/all/card/transaction/prepare`, body).pipe(
      map(res => {
        if (!res.success || res.result.actionType === 'ERROR') {
          this.toastrService.error(res.result.message as string);
        }
        return this.sessionService.handleResponse(res);
      }),
      catchError(this.sessionService.handleError)
    );
  }
}
