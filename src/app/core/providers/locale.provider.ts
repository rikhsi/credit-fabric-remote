import { LOCALE_ID, inject, Provider } from '@angular/core';
import { DEFAULT_LANGUAGE, Language, LocalStorageItem } from '@constants';
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
