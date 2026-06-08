import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class EptService {
  private API_URL = `${environment.API_BASE}/api/v1`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) { }

  getDocs(direction: string): Observable<any> {
    const url = `${this.API_URL}/core/bank-mail/get/docs`;
    return this._http.get<any>(url, {
      params: {
        direction: direction
      }
    }).pipe(
        map(this._sessionService.handleResponse<any>)
      );
  }

  getDocById(documentId: string) {
    const url = `${this.API_URL}/core/bank-mail/get/doc/by-documentId`;
    return this._http.get<any>(url, {
      params: {
        documentId: documentId
      }
    }).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  getOperationByDocId(documentId: string) {
    const url = `${this.API_URL}/core/bank-mail/get/operation/by-documentId`;
    return this._http.get<any>(url, {
      params: {
        documentId: documentId
      }
    }).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  getRecallByClientId(direction: string) {
    const url = `${this.API_URL}/core/bank-mail/get/recalls/by-clientId`;
    return this._http.get<any>(url, {
      params: {
        direction: direction
      }
    }).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }
}
