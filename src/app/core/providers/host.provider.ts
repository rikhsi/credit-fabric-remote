import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const provideHostInit = provideAppInitializer(() => inject(AuthService).initHost() ?? undefined);
