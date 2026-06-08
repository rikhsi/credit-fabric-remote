import { inject, Injectable } from '@angular/core';
import { CreateReportReqDto } from './create-statement.model';
import { catchError, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { SessionService } from 'src/app/core/services/session.service';
import { BackendResponse } from 'src/app/core/models/backend-response.model';

@Injectable({
  providedIn: 'root'
})
export class CreateStatementApiService {
  private API_URL = `${environment.API_BASE}`;
  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);

  constructor() { }


  createReport(body: CreateReportReqDto): Observable<{ message: string } | null> {
    return this._http.post<BackendResponse<{ message: string }>>(`${this.API_URL}/api/account/v1/create/report`, body).pipe(
      map(this._sessionService.handleResponse<{ message: string }>),
      catchError(this._sessionService.handleError)
    )
  }


}
