import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable} from "rxjs";
import {BackendResponse} from "../../../../../core/models/backend-response.model";
import { HttpClient } from "@angular/common/http";
import {SessionService} from "../../../../../core/services/session.service";
import {environment} from "../../../../../../environments/environment";
import {PassiveUserDto} from "../models/passive-users.model";

@Injectable({
  providedIn: 'root'
})
export class PassiveUsersService {

private _http = inject(HttpClient)
private _sessionService = inject(SessionService);
  private API_URL = `${environment.API_BASE}/api/v1`;

  getPassiveUsers(paging:{page:number,size:number}): Observable<PassiveUserDto | null> {
    return this._http.post<BackendResponse<PassiveUserDto>>(`${this.API_URL}/core/user/get/passive-user/list`,{paging}).pipe(
      map(this._sessionService.handleResponse<PassiveUserDto>),
      catchError(this._sessionService.handleError)
    );
  }
  deletePassiveUser(id:string): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/user/delete/passive-user`,{id}).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }

  createPassiveUser(payload: {
    password: string | null | undefined;
    phoneNumber: any;
    name: string | null | undefined
    surname: string | null | undefined
  }): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/user/create/passive-user`,payload).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
}
