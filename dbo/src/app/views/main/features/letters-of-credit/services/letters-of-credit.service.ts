import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { TokenInitResponse } from '../../../../auth/models/auth.model';
import { SessionService } from '../../../../../core/services/session.service';
import { BackendResponse } from '../../../../../core/models/backend-response.model';
import { CreateAccredit } from '../models/letter-of-credit.model';

@Injectable({
  providedIn: 'root'
})
export class LettersOfCreditService {
  private API_URL = `${environment.API_BASE}/api/v1`;


  constructor(
    private http: HttpClient,
    private _sessionService: SessionService,
  ) { }

  createAccredit(data: CreateAccredit) {
    const url = `${this.API_URL}/core/accredit/create`;
    return this.http.post<BackendResponse<any>>(url, {
      businessName: null,
      inn: null,
      userId: null,
      businessId: null,
      ...data,
    })
      .pipe(
        map(this._sessionService.handleResponse<any>)
      );
  }
}
