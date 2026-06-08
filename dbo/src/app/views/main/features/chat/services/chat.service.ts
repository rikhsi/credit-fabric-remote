import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { FaqItems, ConnectResponse } from '../models/chat.model';
import {AccordionItems, QuestionDto} from "../models/faq.model";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API_URL_BASE = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {}

  getFAQList(): Observable<AccordionItems[] | null> {
    return this._http.get<BackendResponse<AccordionItems[]>>(`${this.API_URL_BASE}/core/chat/faq/question-answer`).pipe(
      map(this._sessionService.handleResponse<AccordionItems[]>),
      catchError(this._sessionService.handleError)
    );
  }

  connectSocket(): Observable<ConnectResponse | null> {
    return this._http.get<BackendResponse<ConnectResponse>>(`${this.API_URL_BASE}/api/integration/v1/chat/init`).pipe(
      map(this._sessionService.handleResponse<ConnectResponse>),
      catchError(this._sessionService.handleError)
    );
  }
  uploadChatImage(file: any): Observable<any> {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return this._http.post<any>(`https://corpfilechat-dev.hamkorbank.uz/file/chat/upload`, formData, {headers: {'Authorization': 'Basic Y29ycC1maWxlLWNoYXQ6ZGVDQWQ5emh0cFlTTDc3S1NLNXQ='}
    }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }

}
