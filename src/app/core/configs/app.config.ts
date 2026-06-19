import { ApplicationConfig, importProvidersFrom, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import ru from '@angular/common/locales/ru';
import en from '@angular/common/locales/en';
import uz from '@angular/common/locales/uz';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideTransloco } from '@jsverse/transloco';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { ngZorroConfig } from './nz.config';
import { provideIcon, provideLang, provideLocaleId, provideTheme, TranslocoProvider } from '@core/providers';
import { routes } from '@app/app.routes';
import {
  apiInterceptor,
  authInterceptor,
  cacheInterceptor,
  errorInterceptor,
  headersInterceptor,
  langInterceptor,
} from '@core/interceptors';
import { DEFAULT_LANGUAGE } from '@app/constants/language';

registerLocaleData(ru, 'ru');
registerLocaleData(en, 'en');
registerLocaleData(uz, 'uz');

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(NgxExtendedPdfViewerModule),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withHashLocation(),
      withViewTransitions(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
        defaultQueryParamsHandling: 'merge',
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(
      withInterceptors([apiInterceptor, authInterceptor, errorInterceptor, langInterceptor, headersInterceptor, cacheInterceptor]),
      withFetch(),
    ),
    provideTransloco({
      config: {
        availableLangs: ['uz', 'ru', 'en'],
        defaultLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoProvider,
    }),
    importProvidersFrom(JwtModule.forRoot({})),
    provideEnvironmentNgxMask(),
    provideNzConfig(ngZorroConfig),
    provideTheme,
    provideLang,
    provideIcon,
    provideLocaleId(),
    NzModalService,
    NzDrawerService,
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: {
        dateFormat: 'dd.MM.yyyy HH:mm',
      },
    },
  ],
};
