import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { BackendResponse } from '../models/backend-response.model';
import { catchError, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  private API_URL = `${environment.API_BASE}/api/v1`;


  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
  }


  getConversionIdn() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/conversion/idn`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  calculateCurrencyRate(fromCurrency: string, toCurrency: string, amount = 1) {
    let params = {
      fromCurrency,
      toCurrency,
      amount
    }

    this._http.get<BackendResponse<any>>(`${this.API_URL}/core/conversion/calculate-amount/by-currency`,
      { params }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getLimit(currency?: string, amount?: number) {
    let q = '';
    if(amount) {
      q = `?currency=${currency}&amount=${amount}`;
    }
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/conversion/limit${q}`).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }
}
