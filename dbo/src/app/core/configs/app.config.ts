import { ApplicationConfig, importProvidersFrom, inject, isDevMode, provideAppInitializer, LOCALE_ID  } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrConfigConst, TranslateConfigConst } from './app.packages.config';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { APP_ROUTES } from '../../app.routes';
import { DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideNgxMask } from 'ngx-mask';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { environment } from "../../../environments/environment";
import { httpErrorInterceptor } from '../interceptors/http-error.interceptor';
import { CustomDateAdapter } from '../services/custom-date-adapter.service';
import { registerLocaleData } from '@angular/common';
import ruLocale from '@angular/common/locales/ru';
import { provideServiceWorker } from "@angular/service-worker";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireMessagingModule, VAPID_KEY, SERVICE_WORKER } from "@angular/fire/compat/messaging";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { tokenRefreshInterceptor } from '../interceptors/refreshToken.interceptor';
import { apiDurationInterceptor } from '../interceptors/api-duration.interceptor';
import { ThemeService } from 'src/app/shared/services/theme.service';
import {AngularFireAnalyticsModule} from "@angular/fire/compat/analytics";

registerLocaleData(ruLocale, 'ru');

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
   provideAppInitializer((theme = inject(ThemeService)) => {
      theme.init();
    }),
    provideNgxMask(),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideToastr(ToastrConfigConst),
    provideHttpClient(withInterceptors([authInterceptor, tokenRefreshInterceptor, apiDurationInterceptor, httpErrorInterceptor])),
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    importProvidersFrom(
      TranslateModule.forRoot(TranslateConfigConst),
      MatDialogModule,
      AngularFireModule.initializeApp(environment.production ? environment.firebaseConfigProd :  environment.firebaseConfigDev),
      AngularFireMessagingModule,
      AngularFireAnalyticsModule
    ),
    { provide: VAPID_KEY, useValue: (environment as any).vapidKey || null },
    {
      provide: SERVICE_WORKER,
      useFactory: () => {
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          return navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        }
        return Promise.resolve(null as any);
      }
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: LOCALE_ID, useValue: 'ru' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
};
