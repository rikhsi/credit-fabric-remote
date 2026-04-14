import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserItem } from '@api/models/base';
import { QUEUE_TYPE } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private http: HttpClient) {}

  public getCurrent$() {
    return this.http.get<UserItem>('sys-user/current', {
      context: new HttpContext().set(QUEUE_TYPE, 'core'),
    });
  }
}
