import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { AddServiceRequest, PaynetCheckRequest, ServiceOneDto, SubCategoriesResponse } from '../types/my-office.model';

@Injectable({
  providedIn: 'root'
})
export class MyOfficeService {
  private API_URL = `${environment.API_BASE}/api/v1`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {}

  getSubcategory(parent: string): Observable<SubCategoriesResponse | null> {
    return this._http.post<BackendResponse<SubCategoriesResponse>>(`${this.API_URL}/core/my/office/service/list`, { parent }).pipe(
      map(this._sessionService.handleResponse<SubCategoriesResponse>),
      catchError(this._sessionService.handleError)
    );
  }

  getServiceOne(uuid: string): Observable<ServiceOneDto | null> {
    return this._http.post<BackendResponse<ServiceOneDto>>(`${this.API_URL}/core/my/office/service/one`, { uuid }).pipe(
      map(this._sessionService.handleResponse<ServiceOneDto>),
      catchError(this._sessionService.handleError)
    );
  }

  paynetCheck(body: PaynetCheckRequest): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/my/office/service/check`, { ...body }).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  addService(body: AddServiceRequest): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/my/office/service/add`, { ...body }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  myOfficePaymentPrepare(body: any): Observable<{id: string} | null> {
    return this._http.post<BackendResponse<{id: string}>>(`${this.API_URL}/core/payment/prepare-munis-transaction`, { ...body }).pipe(
      map(this._sessionService.handleResponse<{id: string}>),
      catchError(this._sessionService.handleError)
    );
  }

  myOfficePaymentSign(body: any): Observable<{ additional: string; externalId: string } | null> {
    return this._http.post<BackendResponse<{ additional: string; externalId: string }>>(`${this.API_URL}/core/sign/sign`, { ...body }).pipe(
      map(this._sessionService.handleResponse<{ additional: string; externalId: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  myOfficePaymentSignConfirm(body: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/sign/confirm`, { ...body }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getInfo(id: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/payment/request/saved-uzs-one`, { id }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
}
