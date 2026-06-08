import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { MyAutoDto, MyAutoInfoDto, MyAutoInsuranceDto, MyAutoLicenseDto } from '../models/transport.model';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private API_URL = `${environment.API_BASE}/api/v1`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
    ) {}

  
  getMyAutoList(): Observable<MyAutoDto[] | null> {
    return this._http.get<BackendResponse<MyAutoDto[]>>(`${this.API_URL}/core/my-auto/get/list`).pipe(
      map(this._sessionService.handleResponse<MyAutoDto[]>),
      catchError(this._sessionService.handleError)
    );
  }
  
  getMyAutoInsurance(id: string): Observable<MyAutoInsuranceDto | null> {
    return this._http.post<BackendResponse<MyAutoInsuranceDto>>(`${this.API_URL}/core/my-auto/get/insurance`, { id }).pipe(
      map(this._sessionService.handleResponse<MyAutoInsuranceDto>),
      catchError(this._sessionService.handleError)
    );
  }
  
  getMyAutoInfo(id: string): Observable<MyAutoInfoDto | null> {
    return this._http.post<BackendResponse<MyAutoInfoDto>>(`${this.API_URL}/core/my-auto/get/info`, { id }).pipe(
      map(this._sessionService.handleResponse<MyAutoInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }
  
  getMyAutoLicense(): Observable<MyAutoLicenseDto[] | null> {
    return this._http.get<BackendResponse<MyAutoLicenseDto[]>>(`${this.API_URL}/core/my-auto/license`).pipe(
      map(this._sessionService.handleResponse<MyAutoLicenseDto[]>),
      catchError(this._sessionService.handleError)
    );
  }
  
  refreshLicense(): Observable<any> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/my-auto/refresh/license`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  
  refreshInsurance(id: string): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/my-auto/refresh/insurance`, { id }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
}
