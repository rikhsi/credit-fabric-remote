import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { OperDayDto } from '../models/right-bar.model';

@Injectable({
  providedIn: 'root'
})
export class RightBarService {
  private API_URL_BASE = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {}

  getOperDay(): Observable<OperDayDto | null> {
    return this._http.get<BackendResponse<OperDayDto>>(`${this.API_URL_BASE}/core/business/oper-day`).pipe(
      map(this._sessionService.handleResponse<OperDayDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getCurrencyRate(): Observable<any | null> {
    // const query = type ? `&currencyType=${type}` : ''
    return this._http.post(`${this.API_URL_BASE}/api/currency-conversion/v1/currency/request/get-list-exchange-rates`, {}).pipe(
      catchError(this._sessionService.handleError)
    )
  }
}
