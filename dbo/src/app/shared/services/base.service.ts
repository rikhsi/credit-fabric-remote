//  Anuglar 
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";


// Global Service
import { SessionService } from "../../core/services/session.service";
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import {NewSessionService} from "src/app/views/main/features/new-settings/services/new-session.service"


@Injectable({
    providedIn: 'root'
})


export class BaseService {
    protected readonly http = inject(HttpClient);
    protected readonly session = inject(SessionService);
    protected readonly newSession = inject(NewSessionService);

   
    get<TResponse, TParams extends Record<string, any> = Record<string, any>>(url: string, params?: TParams): Observable<TResponse | null> {
        const httpParams = new HttpParams({ fromObject: params || {} });
        return this.http.get<BackendResponse<TResponse>>(url, { params: httpParams })
            .pipe(
                map(this.session.handleResponse<TResponse>),
                catchError(this.session.handleError)
            );
    }

    post<TResponse, TBody = unknown>(url: string, body?: TBody, headers?:any): Observable<TResponse | null> {
        return this.http.post<BackendResponse<TResponse>>(url, body,  {headers: headers})
            .pipe(
                map(this.session.handleResponse<TResponse>),
                catchError(this.session.handleError)
            );
    }


    put<TResponse, TBody = unknown>(url: string, body?: TBody): Observable<TResponse | null> {
        return this.http
            .put<BackendResponse<TResponse>>(url, body)
            .pipe(
                map(this.session.handleResponse<TResponse>),
                catchError(this.session.handleError)
            );
    }

    delete<TResponse, TParams extends Record<string, any> = Record<string, any>>(url: string, params?: TParams): Observable<TResponse | null> {
        const httpParams = new HttpParams({ fromObject: params || {} });
        return this.http
            .delete<BackendResponse<TResponse>>(url, { params: httpParams })
            .pipe(
                map(this.session.handleResponse<TResponse>),
                catchError(this.session.handleError)
            );
    }
}