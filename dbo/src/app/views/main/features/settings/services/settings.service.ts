import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {SessionService} from "../../../../../core/services/session.service";
import {environment} from "../../../../../../environments/environment";
import {catchError, map, Observable} from "rxjs";
import {BackendResponse} from "../../../../../core/models/backend-response.model";
import {permitUserArray, SignOrderResponse, UsersDto} from "../models/settings.model";


@Injectable({
  providedIn: "root",
})
export class SettingsService {

  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);
  private API_URL = `${environment.API_BASE}`


  getUsers(paging:{page:number,size:number}): Observable<UsersDto | null> {
    return this._http.get<BackendResponse<UsersDto>>(`${this.API_URL}/core/user/get/list?page=${paging.page}&size=${paging.size}`).pipe(
      map(this._sessionService.handleResponse<UsersDto>),
      catchError(this._sessionService.handleError)
    );
  }
  getOrders(): Observable<SignOrderResponse[] | null> {
    return this._http.get<BackendResponse<SignOrderResponse[]>>(`${this.API_URL}/core/sign-order/get/all`).pipe(
      map(this._sessionService.handleResponse<SignOrderResponse[]>),
      catchError(this._sessionService.handleError)
    );
  }
  attachAccount(data:Array<{userId:string,accountNumber:string}>): Observable<{msg:string} | null> {
    return this._http.post<BackendResponse<{msg:string}>>(`${this.API_URL}/core/account/add/permitted`,data).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
      catchError(this._sessionService.handleError)
    );
  }
  permitGetAll(clientId:number): Observable<permitUserArray[] | null> {
    return this._http.get<BackendResponse<permitUserArray[]>>(`${this.API_URL}/core/account/get/all/permitted?clientId=${clientId}`).pipe(
      map(this._sessionService.handleResponse<permitUserArray[]>),
      catchError(this._sessionService.handleError)
    );
  }
  deletePermit(id:number): Observable<{msg:string} | null> {
    return this._http.delete<BackendResponse<{msg:string}>>(`${this.API_URL}/core/account/delete/permitted/${id}`).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteSignOrder(id:number): Observable<{msg:string} | null> {
    return this._http.delete<BackendResponse<{msg:string}>>(`${this.API_URL}/core/sign-order/delete/${id}`).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
      catchError(this._sessionService.handleError)
    );
  }
  getOneSignOrder(id:number): Observable<SignOrderResponse | null> {
    return this._http.get<BackendResponse<SignOrderResponse>>(`${this.API_URL}/core/sign-order/get/${id}`).pipe(
      map(this._sessionService.handleResponse<SignOrderResponse>),
      catchError(this._sessionService.handleError)
    );
  }
  getMaps(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/support-info/v1/point/list/all`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getMapsFilter(data={}): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/support-info/v1/point/filter`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  addSignOrder(payload:any): Observable<{msg:string} | null> {
    return this._http.post<BackendResponse<{msg:string}>>(`${this.API_URL}/core/sign-order/add`,payload).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
    );
  }
  editSignOrder(id:number ,payload:any): Observable<{msg:string} | null> {
    return this._http.put<BackendResponse<{msg:string}>>(`${this.API_URL}/core/sign-order/edit/${id}`,payload).pipe(
      map(this._sessionService.handleResponse<{msg:string}>),
      catchError(this._sessionService.handleError)
    );
  }
}
