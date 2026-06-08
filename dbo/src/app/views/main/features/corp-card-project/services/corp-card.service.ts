

import {map, Observable} from 'rxjs';
import {DestroyRef, inject, Injectable} from '@angular/core';

import { environment } from 'src/environments/environment';
import { BaseService } from 'src/app/shared/services/base.service';


import {BackendResponse, BalanceResponse} from 'src/app/core/models/backend-response.model';
import { CardTotalBalanceRequest } from '../model/shared-card.model';
import { LimitActionsRequest, LimitCategoryList, LimitInfo } from '../model/limit.model';
import { CorpCardTransactionResponse, TransactionFilterRequest } from '../model/transaction-history.model';
import { PayrollProjectRequestToListDtoAll, PayrollProjectResponseListDtoAll } from '../../payroll-project/models/payroll-project.type';
import {SessionService} from "../../../../../core/services/session.service";
import {HttpClient} from "@angular/common/http";



@Injectable({
  providedIn: 'root'
})

export class CorpCardService extends BaseService {

  private _sessionService = inject(SessionService)
  private _http = inject(HttpClient)
  private baseUrl = `${environment.API_BASE}`;

  getCardsTotalBalance(payload: CardTotalBalanceRequest): Observable<BalanceResponse | null> {
    return this.post<BalanceResponse>(`${this.baseUrl}/api/salary-card/v1/card/all/total-balance`, payload)
  }

  getAllPayrollProjectList(payload: PayrollProjectRequestToListDtoAll): Observable<PayrollProjectResponseListDtoAll | null> {
    return this.post<PayrollProjectResponseListDtoAll>(`${this.baseUrl}/api/salary-card/v1/card/all`, payload, { 'X-Device-Type': 'WEB' })
  }

  getTransactionHistory(payload?: TransactionFilterRequest): Observable<CorpCardTransactionResponse | null> {
    return this.post<CorpCardTransactionResponse>(`${this.baseUrl}/api/salary-card/v1/card/all/history`, payload)
  }

  unpinCard(cardId: string): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/all/unpin`, { cardId }, { 'X-Device-Type': 'WEB' })
  }

  createPinCard(cardId: string): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/all/create/pin`, { cardId }, { 'X-Device-Type': 'WEB' })
  }

  changeTitle(payload: any): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/title`, payload,)
  }

  getSalaryExcelFile(payload: CardTotalBalanceRequest): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/salary/all/generate/file`, payload)
  }

  // blockCard(payload?: { id: string }): Observable<{ msg: string } | null> {
  //   return this._http.post<BackendResponse<{ msg: string }>>(`${this.baseUrl}/api/salary-card/v1/card/all/block-card`, payload).pipe(
  //       map(this._sessionService.handleResponse<{id: string}>)
  //     );
  // }

  blockCard(payload?: { id: string }): Observable<{ msg: string } | null>{
    return this._http.post<BackendResponse<any>>(
      `${this.baseUrl}/api/salary-card/v1/card/all/block-card`, payload)
      .pipe(
        map(this._sessionService.handleResponseResult<any>)
      );
  }

  // unBlockCard(payload?: { id: string }): Observable<{ msg: string } | null> {
  //     return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/all/unblock-card`, payload)
  // }

  unBlockCard(payload?: { id: string }): Observable<{ msg: string } | null>{
    return this._http.post<BackendResponse<any>>(
      `${this.baseUrl}/api/salary-card/v1/card/all/unblock-card`, payload)
      .pipe(
        map(this._sessionService.handleResponseResult<any>)
      );
  }


  corpCardTransactionHistoryPDF(payload?: { id: string }): Observable<any | null> {
    return this.get(`${this.baseUrl}/api/salary-card/v1/receipt/generate/pdf`, payload)
  }

  corpCardInfoPDF(payload?: { id: string }): Observable<any | null> {
    return this.get(`${this.baseUrl}/api/salary-card/v1/receipt/generate/card/pdf`, payload)
  }



  // Limits

  getLimitCategory(): Observable<LimitCategoryList | null> {
    return this.get<LimitCategoryList>(`${this.baseUrl}/api/salary-card/v1/card/all/limits/list`)
  }

  getLimitInfo(payload?: { id: string }): Observable<LimitInfo | null> {
    return this.post<LimitInfo>(`${this.baseUrl}/api/salary-card/v1/card/all/limits/info`, payload)
  }

  getLimitHistory(payload?: { id: string }): Observable<LimitInfo[] | null> {
    return this.post<LimitInfo[]>(`${this.baseUrl}/api/salary-card/v1/card/all/limits/history`, payload)
  }

  addLimit(payload?: LimitActionsRequest): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/all/limits/add`, payload)
  }

  removeLimit(payload?: { uuid: string, limitId: number }): Observable<{ msg: string } | null> {
    return this.post<{ msg: string }>(`${this.baseUrl}/api/salary-card/v1/card/all/limits/delete`, payload)
  }




  getAllCardSelectOptions(
    cardUserType: 'UNKNOWN' | 'PRIVATE' | 'CORPORATE' | 'PENSION' | 'SALARY'
  ) {
    return this.http.get(
      `${this.baseUrl}/api/salary-card/v1/card/all/get/card/select-options`,
      {
        params: {
          cardUserType
        }
      }
    );
  }
  
}
