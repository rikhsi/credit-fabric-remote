import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ID, UUID } from '../../../transport/types/transport.types';
import {
  AddMyOfficeRequest,
  AddMyOfficeResponse,
  AddMyOfficeServiceRequest,
  AddMyOfficeServiceResponse,
  EditMyOfficeRequest,
  EditMyOfficeResponse,
  EditMyOfficeServiceRequest,
  EditMyOfficeServiceResponse,
  MyOfficeItem,
  MyOfficeResponse,
  MyOfficeService,
  MyOfficeServiceCheckResponse,
  MyOfficeServiceRefreshResponse,
  MyOfficesResponse,
  PaymentNavItem,
  PaymentNavResponse,
  PSOResponse,
  RemoveMyOfficeRequest,
  RemoveMyOfficeResponse,
  RemoveMyOfficeServiceRequest,
  RemoveMyOfficeServiceResponse,
} from '../types/my-office.type';

class PSCRequest {
}

@Injectable({
  providedIn: 'root'
})
export class OfficeService implements OnDestroy{
  private _destroy$ = new Subject<void>();
  private API_URL = `${environment.API_BASE}/api/v1`;
  private readonly _services = new BehaviorSubject<PaymentNavItem[] | null>(
    null
  );
  public readonly services$ = this._services.asObservable();
  public get services(): PaymentNavItem[] | null {
    return this._services.getValue();
  }
  public set services(val: PaymentNavItem[] | null) {
    this._services.next(val);
  }

  private readonly _officeServices = new BehaviorSubject<MyOfficeService[] | null>(
    null
  );
  public readonly officeServices$ = this._officeServices.asObservable();
  public get officeServices(): MyOfficeService[] | null {
    return this._officeServices.getValue();
  }
  public set officeServices(val: MyOfficeService[] | null) {
    this._officeServices.next(val);
  }

  public readonly reFetchOffice$ = new BehaviorSubject<boolean>(false);
  private readonly _office = new BehaviorSubject<MyOfficeItem | null>(null);

  public readonly office$ = this._office.asObservable();
  public get office(): MyOfficeItem | null {
    return this._office.getValue();
  }
  public set office(office: MyOfficeItem | null) {
    this._office.next(office);
  }

   constructor(
    private _http: HttpClient,
    private _toastr: ToastrService
  ) {}

  public getOfficeList(): Observable<MyOfficesResponse> {
    return this._http.get<MyOfficesResponse>(`${this.API_URL}/core/my/office/list`).pipe(take(1));
  }
  public getDetailMyOffice(id: { id: string | undefined }): Observable<MyOfficeResponse> {
    return this._http.post<MyOfficeResponse>(`${this.API_URL}/core/my/office/one`, id).pipe(take(1));
  }

  public getCategories(): Observable<PaymentNavResponse> {
    return this._http
      .get<PaymentNavResponse>(`${this.API_URL}/core/my/office/service/list`)
      .pipe(take(1));
  }
  public getCategory(parent: {
    parent: string;
  }): Observable<PaymentNavResponse> {
    return this._http
      .post<PaymentNavResponse>(
        `${this.API_URL}/core/my/office/service/list`,
        parent
      )
  }
  public getServiceParams(uuid: UUID<string>): Observable<PSOResponse> {
    return this._http
      .post<PSOResponse>(`${this.API_URL}/core/my/office/service/one`, uuid)
      .pipe(take(1));
  }
  public getServiceCheck(
    data: PSCRequest
  ): Observable<MyOfficeServiceCheckResponse> {
    return this._http
      .post<MyOfficeServiceCheckResponse>(
        `${this.API_URL}/core/my/office/service/check`,
        data
      )
      .pipe(take(1));
  }
  public getServiceRefresh(
    id: ID<string>
  ): Observable<MyOfficeServiceRefreshResponse> {
    return this._http
      .post<MyOfficeServiceRefreshResponse>(
        `${this.API_URL}/core/my/office/service/refresh`,
        id
      )
      .pipe(take(1));
  }
  public getServiceOne(uuid: UUID<string>): Observable<PSOResponse> {
    return this._http
      .post<PSOResponse>(`${this.API_URL}/core/my/office/service/one`, uuid)
      .pipe(take(1));
  }

  public addOffice(data: AddMyOfficeRequest): Observable<AddMyOfficeResponse> {
    return this._http
      .post<AddMyOfficeResponse>(`${this.API_URL}/core/my/office/add`, data)
      .pipe(take(1));
  }
  public editOffice(data: EditMyOfficeRequest): Observable<EditMyOfficeResponse> {
    return this._http
      .post<EditMyOfficeResponse>(`${this.API_URL}/core/my/office/edit`, data)
      .pipe(take(1));
  }
  public deleteOffice(id: RemoveMyOfficeRequest): Observable<RemoveMyOfficeResponse> {
    return this._http
      .post<RemoveMyOfficeResponse>(`${this.API_URL}/core/my/office/delete`, id)
      .pipe(take(1));
  }

  public addOfficeService(
    data: AddMyOfficeServiceRequest
  ): Observable<AddMyOfficeServiceResponse> {
    return this._http
      .post<AddMyOfficeServiceResponse>(
        `${this.API_URL}/core/my/office/service/add`,
        data
      )
      .pipe(take(1));
  }
  public editOfficeService(
    data: EditMyOfficeServiceRequest
  ): Observable<EditMyOfficeServiceResponse> {
    return this._http
      .post<EditMyOfficeServiceResponse>(
        `${this.API_URL}/core/my/office/service/edit`,
        data
      )
      .pipe(take(1));
  }
  public removeOfficeService(
    id: RemoveMyOfficeServiceRequest
  ): Observable<RemoveMyOfficeServiceResponse> {
    return this._http
      .post<RemoveMyOfficeServiceResponse>(
        `${this.API_URL}/core/my/office/service/remove`,
        id
      )
      .pipe(take(1));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
