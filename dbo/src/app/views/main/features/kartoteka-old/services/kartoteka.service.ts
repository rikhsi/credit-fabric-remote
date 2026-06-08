//  Anuglar 
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';

// Environment
import { environment } from "../../../../../../environments/environment";


// Global Service
import { SessionService } from "../../../../../core/services/session.service";

// Heplers

import { catchError, map, Observable, Subject } from 'rxjs';


// Models
import { Ambulance } from '../models/ambulance.interface';
import { Booking } from '../models/booking.interface';
import { BackendResponse } from "../../../../../core/models/backend-response.model";
import { StatusListResponseData } from '../components/filter-kartoteka-2/kartoteka-2.interface';
import { kartotekaResponse, KartotekaTransactionsResponse, RecipientData } from "../models/kartoteka.model";


@Injectable({
  providedIn: 'root'
})


export class KartotekaService {
  private API_URL = `${environment.API_BASE}`;
  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);

  private data = new Subject<any>();
  data$ = this.data.asObservable();

  changeData(data: any) {
    this.data.next(data);
  }

  getCardFiles(data: { paging: { page: number, size: number }, cardFileType: string, filter: any }): Observable<kartotekaResponse | null> {
    return this._http.post<BackendResponse<kartotekaResponse>>(`${this.API_URL}/api/kartoteka/v1/card-file/get`, data).pipe(
      map(this._sessionService.handleResponse<kartotekaResponse>)
    );
  }

  getRecipientList(search?: string): Observable<RecipientData> {
    let url = `${this.API_URL}/api/kartoteka/v1/card-file/get/recipient/list`;

    if (search) {
      url += `?coName=${encodeURIComponent(search.trim())}`;
    }

    return this._http
      .get<BackendResponse<RecipientData>>(url)
      .pipe(map(this._sessionService.handleResponse<RecipientData>));
  }

  getStatusList(): Observable<StatusListResponseData | null> {
    const url = `${this.API_URL}/api/kartoteka/v1/card-file/get/status/list `;
    return this._http.get<BackendResponse<StatusListResponseData>>(url).pipe(map(this._sessionService.handleResponse<StatusListResponseData>));
  }

  getAmbulance(paging?: { page: number, size: number }): Observable<Ambulance[] | null> {
    const url = `${this.API_URL}/core/bank-mail/get/customer/needs?page=${paging?.page ?? ''}&size=${paging?.size ?? ''}`;
    return this._http.get<BackendResponse<Ambulance[]>>(url).pipe(
      map(this._sessionService.handleResponse<Ambulance[]>)
    );
  }

  getBooking(paging?: { page: number, size: number }): Observable<Booking[] | null> {
    const url = `${this.API_URL}/core/bank-mail/get/customer/reserves?page=${paging?.page ?? ''}&size=${paging?.size ?? ''}`;
    return this._http.get<BackendResponse<Booking[]>>(url).pipe(
      map(this._sessionService.handleResponse<Booking[]>)
    );
  }

  getCardFilesTransactions(documentId: string | null): Observable<KartotekaTransactionsResponse | null> {
    return this._http.post<BackendResponse<KartotekaTransactionsResponse>>(`${this.API_URL}/api/kartoteka/v1/card-file/get/transactions`, { documentId }).pipe(
      map(this._sessionService.handleResponse<KartotekaTransactionsResponse>),
      catchError(this._sessionService.handleError)
    );
  }
}
