import { Injectable, signal } from '@angular/core';
import { UserItem } from '@api/models/base';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserItem>(null);
}
