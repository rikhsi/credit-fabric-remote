import { LOCALE_ID, inject, Provider } from '@angular/core';
import { DEFAULT_LANGUAGE, Language } from '@app/constants/language';
import { LocalStorageItem } from '@app/constants/local-storage';
import { LocalStorageService } from '@core/services';

export function provideLocaleId(): Provider {
  return {
    provide: LOCALE_ID,
    useFactory: () => {
      const ls = inject(LocalStorageService);
      const lang: Language = ls.getItem(LocalStorageItem.Language) ?? DEFAULT_LANGUAGE;

      return lang;
    },
  };
}
