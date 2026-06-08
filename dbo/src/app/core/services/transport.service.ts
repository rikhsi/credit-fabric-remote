import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

import { HttpClient } from "@angular/common/http";
import {
  MyAutoData, TransportAddRequest, TransportAddResponse,
  TransportInfoResponse, TransportRefreshResponse,
  TransportResponse,
  UUID
} from "../../views/main/features/transport/types/transport.types";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private API_URL = `${environment.API_BASE}/api/v1`;
  private readonly _transport = new BehaviorSubject<MyAutoData | null>(null);
  public readonly transport$ = this._transport.asObservable();
  public set transport(transport: MyAutoData | null) {
    this._transport.next(transport);
  }
  public get transport(): MyAutoData | null {
    return this._transport.getValue();
  }

  public refetchTransport = new Subject<boolean>();
  public refreshTransport = new Subject<boolean>();

  private constructor(private _http: HttpClient) {}

  public getMyAutoAll(): Observable<TransportResponse> {
    return this._http.get<TransportResponse>(`${this.API_URL}/core/my-auto/get/list`).pipe(take(1));
  }
  public getMyAutoInfo(uuid: UUID<string>): Observable<TransportInfoResponse> {
    return this._http
      .post<TransportInfoResponse>(`${this.API_URL}/core/my-auto/get/info`, uuid)
      .pipe(take(1));
  }

  public addAuto(): Observable<any> {
    return this._http
      .get<any>(`${this.API_URL}/core/my-auto/add`)
      .pipe(take(1));
  }

  public postAutoInfo<T, K>(
    data: T,
    path: string,
    type: string
  ): Observable<K> {
    return this._http
      .post<K>(`${this.API_URL}/core/my-auto/${path}/${type}`, data)
      .pipe(take(1));
  }
  public getAutoInfo<T>(uuid: UUID<string>, type: string): Observable<T> {
    return this._http
      .post<T>(`${this.API_URL}/core/my-auto/get/${type}`, uuid)
      .pipe(take(1));
  }

  public refreshTransportList(): Observable<TransportRefreshResponse> {
    return this._http
      .post<TransportRefreshResponse>(
        `${this.API_URL}/my/auto/refresh`,
        {}
      )
      .pipe(take(1));
  }
}
