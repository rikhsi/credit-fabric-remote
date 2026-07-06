import { DOCUMENT } from '@angular/common';
import { inject, provideAppInitializer } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { LocalStorageItem } from '@app/constants/local-storage';
import { resolveTheme, Theme } from '@app/constants/theme';
import { LocalStorageService } from '@core/services/local-storage.service';

export const provideTheme = provideAppInitializer(() => {
  const themeService = inject(ThemeService);
  const lsService = inject(LocalStorageService);
  const document = inject(DOCUMENT);

  const savedTheme = lsService.getItem(LocalStorageItem.Theme) as Theme | null;
  const themeToSet = resolveTheme(document, savedTheme);

  return themeService.setTheme(themeToSet);
});
