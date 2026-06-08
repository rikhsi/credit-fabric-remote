import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable} from 'rxjs';
import {BackendResponse} from 'src/app/core/models/backend-response.model';
import {SessionService} from 'src/app/core/services/session.service';
import {environment} from 'src/environments/environment';
import {PageRequest} from "../../loans/models/loan.model";
import {
  CorpCardBalanceDto,
  CorpCardListDto, CorpCardTransactionDto, PageRequestWIthDate,
  PageRequestWIthUpdate,
  RequisiteCorpCarDto
} from "../models/corp-card.model";
import {MyOfficeItem} from "../../my-office/office/types/my-office.type";

@Injectable({
  providedIn: 'root',
})
export class CorpCardService {
  private API_URL = `${environment.API_BASE}/api`;
  public readonly reFetchOffice$ = new BehaviorSubject<boolean>(false);
  private readonly _card = new BehaviorSubject<CorpCardListDto | null>(null);

  public readonly card$ = this._card.asObservable();

  public get card(): CorpCardListDto | null {
    return this._card.getValue();
  }

  public set card(office: CorpCardListDto | null) {
    this._card.next(office);
  }

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
  }

  getCorpCardList(): Observable<CorpCardListDto | null> {
    return this._http.get<BackendResponse<CorpCardListDto>>(`${this.API_URL}/salary-card/v1/card/get-client-corp-card-list`).pipe(
      map(this._sessionService.handleResponse<CorpCardListDto>),
      catchError(this._sessionService.handleError)
    );
  }
  syncCorpCardList(): Observable<{ msg:string } | null> {
    return this._http.get<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/card/sync`).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }

  getTotalBalance(data: { cardType: string[] }): Observable<CorpCardBalanceDto | null> {
    return this._http.post<BackendResponse<CorpCardBalanceDto>>(`${this.API_URL}/core/card/balance`, data).pipe(
      map(this._sessionService.handleResponse<CorpCardBalanceDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getRequisite(id: string): Observable<RequisiteCorpCarDto | null> {
    return this._http.post<BackendResponse<RequisiteCorpCarDto>>(`${this.API_URL}/core/card/requisite`, {id}).pipe(
      map(this._sessionService.handleResponse<RequisiteCorpCarDto>),
      catchError(this._sessionService.handleError)
    );
  }

  checkCorpCard(id: string): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/card/uzcard/activate/check`, {id}).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  corpCardToUp(payload: { sender: string, receiver: string, amount: number }): Observable<{id: string}| any > {
    return this._http.post<BackendResponse<{ id: string }>>(`${this.API_URL}/core/card/top-up`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  confirmCard(code: string, uuid: string): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/core/card/uzcard/activate/confirm`, {
      code,
      uuid
    }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionList(payload: PageRequestWIthDate): Observable<CorpCardTransactionDto | null> {
    return this._http.post<BackendResponse<CorpCardTransactionDto>>(`${this.API_URL}/core/card/history`, payload).pipe(
      map(this._sessionService.handleResponse<CorpCardTransactionDto>),
      catchError(this._sessionService.handleError)
    );
  }
}
