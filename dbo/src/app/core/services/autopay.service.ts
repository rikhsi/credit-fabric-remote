import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';
import { BackendResponse } from '../models/backend-response.model';
import { catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutopayService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {
  }

  createAutoPay(body: any) {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/auto/pay`, body).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getAutoPayList() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/auto/pay/all`).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  deleteAutoPay(id: number) {
    return this._http.delete<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/auto/pay/delete/${id}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
}
