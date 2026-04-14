import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthSignInPayload, AuthSignInResult } from '@api/models/base';
import { QUEUE_TYPE } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  constructor(private http: HttpClient) {}

  public signIn$(payload: AuthSignInPayload) {
    return this.http.post<AuthSignInResult>('auth/signin', payload, {
      context: new HttpContext().set(QUEUE_TYPE, 'core'),
    });
  }
}
