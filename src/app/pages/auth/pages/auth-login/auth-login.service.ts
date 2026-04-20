import { Injectable, signal } from '@angular/core';
import { disabled, form, minLength, required } from '@angular/forms/signals';
import { loginModel } from '@pages/auth/data';

@Injectable()
export class AuthLoginService {
  readonly authFormDisabled = signal<boolean>(false);

  readonly authForm = form(signal(loginModel), (schemaPath) => {
    required(schemaPath.username);
    minLength(schemaPath.username, 4);
    required(schemaPath.password);
    minLength(schemaPath.password, 4);
    disabled(schemaPath, this.authFormDisabled);
  });
}
