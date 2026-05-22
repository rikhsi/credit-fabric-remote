import { inject, provideAppInitializer } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { LocalStorageService } from '@core/services';
import { LocalStorageItem } from '@app/constants/local-storage';
import { DEFAULT_THEME, Theme } from '@app/constants/theme';

export const provideTheme = provideAppInitializer(() => {
  const themeService = inject(ThemeService);
  const lsService = inject(LocalStorageService);

  const savedTheme = lsService.getItem(LocalStorageItem.Theme) as Theme | null;
  const themeToSet = savedTheme ?? DEFAULT_THEME;

  return themeService.setTheme(themeToSet);
});
