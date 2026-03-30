import { inject, provideAppInitializer } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { LocalStorageService } from '@core/services';
import { DEFAULT_LANGUAGE, Language, LocalStorageItem, NZ_LOCALES } from '@constants';

export const provideLang = provideAppInitializer(() => {
  const lsService = inject(LocalStorageService);
  const translocoService = inject(TranslocoService);
  const nzI18n = inject(NzI18nService);

  const savedLang = lsService.getItem(LocalStorageItem.Language) as Language | null;
  const langToSet = savedLang ?? DEFAULT_LANGUAGE;

  translocoService.setActiveLang(langToSet);
  nzI18n.setLocale(NZ_LOCALES[langToSet]);

  lsService.setItem(LocalStorageItem.Language, langToSet);

  return of(langToSet);
});
