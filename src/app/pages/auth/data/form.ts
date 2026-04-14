import { signal } from '@angular/core';
import { AuthSignInPayload } from '@api/models/base';
import { environment } from 'src/environments/development';

export const loginModel = signal<AuthSignInPayload>({
  username: '',
  password: '',
  sys_module_id: environment.ablePlatform,
});
