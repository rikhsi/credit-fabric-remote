import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map, Observable} from 'rxjs';
import {BackendResponse} from 'src/app/core/models/backend-response.model';
import {SessionService} from 'src/app/core/services/session.service';
import {environment} from 'src/environments/environment';

import {CalculationResponse, DepositCalculatorDaysDto} from '../models/deposit-calculator.model';
import {
  accountDepositsDto,
  DepositDetailsDto,
  DepositDto,
  DepositSelectListDTO,
  MyDepositsDto,
  WithdrawRequest
} from '../models/deposits.model';
import {PageRequest} from "../../loans/models/loan.model";

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
  }



  getDepositList(payload: PageRequest): Observable<DepositDto | null> {
    return this._http.post<BackendResponse<DepositDto>>(`${this.API_URL}/core/deposit/get/all`, payload).pipe(
      map(this._sessionService.handleResponse<DepositDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getMyDeposits(data:{paging:{page:number ,size:number}}): Observable<MyDepositsDto[] | null> {
    return this._http.post<BackendResponse<MyDepositsDto[]>>(`${this.API_URL}/api/deposit-credit/v1/deposit/request/get-all-deposits-by-filter`,data).pipe(
      map(this._sessionService.handleResponse<MyDepositsDto[]>),
      catchError(this._sessionService.handleError)
    );
  }
  getMomentDeposits(data:{paging:{page:number ,size:number}}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}`,data,{headers:{'X-Device-Type':'WEB'}}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  unpinDeposit(contractId:number, accountNumber:string | undefined):Observable<{ msg:string } | null>{
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/deposit-credit/v1/deposit/unpin`, {contractId: contractId,accountNumber},{headers:{'X-Device-Type':'WEB'}}).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
  createPinDeposit(contractId:number, accountNumber:string | null,codeFilial:string | null):Observable<{ msg:string } | null>{
    return this._http.post<BackendResponse<{msg:string}>>(`${this.API_URL}/api/deposit-credit/v1/deposit/create/pin`, {contractId: contractId,accountNumber,codeFilial},{headers:{'X-Device-Type':'WEB'}}).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
      catchError(this._sessionService.handleError)
    );
  }
  getPinnedDeposits(): Observable<accountDepositsDto | null> {
    return this._http.get<BackendResponse<accountDepositsDto>>(`${this.API_URL}/api/deposit-credit/v1/deposit/pin/list`, {headers:{'X-Device-Type':'WEB'}}).pipe(
      map(this._sessionService.handleResponse<accountDepositsDto>),
      catchError(this._sessionService.handleError)
    );
  }

  calculateDeposit(body: any): Observable<CalculationResponse | null> {
    return this._http.post<BackendResponse<CalculationResponse>>(`${this.API_URL}/core/deposit/calculate-percentage`, body).pipe(
      map(this._sessionService.handleResponse<CalculationResponse>),
      catchError(this._sessionService.handleError)
    )
  }

  getDepositHistoryLink(arrangementId: string): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/deposit/get/history?arrangementId=${arrangementId}`).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  getCalculatorDays() {
    return this._http.get<BackendResponse<DepositCalculatorDaysDto>>(`${this.API_URL}/core/deposit/calculate/days`).pipe(
      map(this._sessionService.handleResponse<DepositCalculatorDaysDto>),
      catchError(this._sessionService.handleError)
    )
  }

  prepareWithdraw(payload: WithdrawRequest): Observable<{ id: string } | null> {
    return this._http.post<BackendResponse<{
      id: string
    }>>(`${this.API_URL}/core/deposit/prepare/withdraw`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  openDeposit(payload:any): Observable<{ id: string } | null> {
    return this._http.post<BackendResponse<{ id: string }>>(`${this.API_URL}/core/deposit/open`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>)
    )
  }

  closeDeposit(payload:any): Observable<{ id: string } | null> {
    return this._http.post<BackendResponse<{ id: string }>>(`${this.API_URL}/core/deposit/close`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>)
    )
  }

  prepareTopUp(payload: WithdrawRequest): Observable<{ id: string } | null> {
    return this._http.post<BackendResponse<{
      id: string
    }>>(`${this.API_URL}/core/deposit/prepare/top-up`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>)
    )
  }

  myDepositPaymentSign(body: any): Observable<{ additional: string; externalId: string } | null> {
    return this._http.post<BackendResponse<{
      additional: string;
      externalId: string
    }>>(`${this.API_URL}/core/sign/sign`, {...body}).pipe(
      map(this._sessionService.handleResponse<{ additional: string; externalId: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  getDepositInfo(id: string | undefined | null): Observable<DepositDetailsDto | null> {
    return this._http.get<BackendResponse<DepositDetailsDto>>(`${this.API_URL}/core/deposit/get/${id}`).pipe(
      map(this._sessionService.handleResponse<DepositDetailsDto>),
      catchError(this._sessionService.handleError)
    )
  }

  myDepositPaymentSignConfirm(body: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/sign/confirm`, {...body}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }


  depositContactList(page: number, size: number, filters?: {search?: string;depositType?: string;currency?: string;}, state: 'APPROVE' | 'CLOSE' = 'APPROVE' ): Observable<any> {
    const body: any = { page, size, state };
    if (filters?.search) body['search'] = filters.search;
    if (filters?.depositType) body['depositType'] = filters.depositType;
    if (filters?.currency) body['currency'] = filters.currency;
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/contract/list`, body).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  depositContactListV2(page: number, size: number,state: 'APPROVE' | 'CLOSE' = 'APPROVE'): Observable<any> {
    const body: any = { page, size,state };
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/contract/list`, body).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }



  depositContactDataList(page:number,size:number):Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/contract/data/list`,{page,size}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getDepositContractById(id: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/contract/get/${id}`, {}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  pinDepositContract(contractId: string, accountNumber: string, codeFilial: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/create/pin`, { contractId, accountNumber, codeFilial }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  unpinDepositContract(contractId: string, accountNumber: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/unpin`, { contractId, accountNumber }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getDepositSelectList(): Observable<DepositSelectListDTO | null> {
    return this._http.get<BackendResponse<DepositSelectListDTO>>(`${this.API_URL}/api/deposit-credit/v1/deposit/select-list`).pipe(
      map(this._sessionService.handleResponse<DepositSelectListDTO>),
      catchError(this._sessionService.handleError)
    );
  }

}
