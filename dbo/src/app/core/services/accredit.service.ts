import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';
import { BackendResponse } from '../models/backend-response.model';
import { catchError, map } from 'rxjs';
import { AccreditItem } from '../../views/main/features/letters-of-credit/models/letter-of-credit.model';

@Injectable({
  providedIn: 'root'
})
export class AccreditService {
  private API_URL = `${environment.API_BASE}/api/v1`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {
  }

  getAccreditList() {
    return this._http.get<BackendResponse<AccreditItem[]>>(`${this.API_URL}/core/accredit/get-all`).pipe(
      map(this._sessionService.handleResponse<AccreditItem[]>),
      catchError(this._sessionService.handleError)
    );
  }
}
