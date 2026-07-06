import { inject, provideAppInitializer } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { Language, DEFAULT_LANGUAGE, NZ_LOCALES, mapBridgeLanguageToAppLanguage } from '@app/constants/language';
import { LocalStorageItem } from '@app/constants/local-storage';
import { AuthService } from '@core/services/auth.service';
import { LocalStorageService } from '@core/services/local-storage.service';

export const provideLang = provideAppInitializer(() => {
  const authService = inject(AuthService);
  const lsService = inject(LocalStorageService);
  const translocoService = inject(TranslocoService);
  const nzI18n = inject(NzI18nService);

  const bridgeLang = mapBridgeLanguageToAppLanguage(authService.user()?.language);
  const savedLang = lsService.getItem(LocalStorageItem.Language) as Language | null;
  const langToSet = bridgeLang ?? savedLang ?? DEFAULT_LANGUAGE;

  translocoService.setActiveLang(langToSet);
  nzI18n.setLocale(NZ_LOCALES[langToSet]);
  lsService.setItem(LocalStorageItem.Language, langToSet);

  return of(langToSet);
});
