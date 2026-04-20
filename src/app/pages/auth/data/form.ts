import { AuthSignInPayload } from '@api/models/base';
import { environment } from 'src/environments/development';

export const loginModel: AuthSignInPayload = {
  username: '',
  password: '',
  sys_module_id: environment.ablePlatform,
};
