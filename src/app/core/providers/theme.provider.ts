import { inject, provideAppInitializer } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { LocalStorageService } from '@core/services';
import { DEFAULT_THEME, LocalStorageItem, Theme } from '@constants';

export const provideTheme = provideAppInitializer(() => {
  const themeService = inject(ThemeService);
  const lsService = inject(LocalStorageService);

  const savedTheme = lsService.getItem(LocalStorageItem.Theme) as Theme | null;
  const themeToSet = savedTheme ?? DEFAULT_THEME;

  return themeService.setTheme(themeToSet);
});
