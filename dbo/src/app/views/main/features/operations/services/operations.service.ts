import {inject, Injectable} from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, Subject } from 'rxjs';
import {BackendResponse} from "../../../../../core/models/backend-response.model";
import { HttpClient } from "@angular/common/http";
import {SessionService} from "../../../../../core/services/session.service";
import {environment} from "../../../../../../environments/environment";
import { RequestConversionReqNewDto } from '../models/conversion.model';
import { SwiftCreate } from '../models/swift.model';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);
  private API_URL = `${environment.API_BASE}/api/v1`;

  conversionTemplate = new BehaviorSubject<any>(null);

  createConversion(data: any): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/conversion/create`, data).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>)
    );
  }

  getOfferAmount(data: any): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/conversion/calculate-amount`, data)
      .pipe(
        map(this._sessionService.handleResponse<any>),
        catchError(this._sessionService.handleError)
      )
  }

  createSiwft(data: SwiftCreate | any): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/swift-payment-order`, data)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>),
        catchError(this._sessionService.handleError)
      );
  }

  getGpiTracker(payload: any) {
    const url = `${this.API_URL}/core/bic/gpi/tracking`;

    return this._http.post<BackendResponse<any>>(url, { ...payload })
      .pipe(
        map(this._sessionService.handleResponse<any>),
        );
  }

  getSwiftPayments(): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/search`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>),
        catchError(this._sessionService.handleError)
      )
  }

  getSwiftMessage(applicationId: string): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/message?applicationId=${applicationId}`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>)
      )
  }

  getAims(): Observable<any> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/conversion/aim`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>),
        catchError(this._sessionService.handleError)
      )
  }

  getBics(bic: string): Observable<any> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/search?bic=${bic}&page=0&size=10`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>),
        catchError(this._sessionService.handleError)
      )
  }

  getIdns(): Observable<any> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/conversion/idn`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>)
      )
  }

  getCountries(searchText?: string): Observable<any> {
    const query = searchText ? `?search=${searchText}` : '';
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/conversion/country${query}`)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }

  getPopCodes(code?: string): Observable<any> {
    const query = code?.trim() ? `?code=${code}` : '';
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/additional-info${query}`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>)
      )
  }

  getSpecialCodes(): Observable<any> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/bic/codes`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>)
      )
  }

  getDocument(fileName: string) {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/file/get-offer-url?type=${fileName}`)
      .pipe(
        map(this._sessionService.handleResponse<{msg: string}>),
        catchError(this._sessionService.handleError)
      )
  }
}
