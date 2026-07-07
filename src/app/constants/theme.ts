export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export const DEFAULT_THEME = Theme.Light;

export function resolveSystemTheme(windowRef: Window | null = typeof window !== 'undefined' ? window : null): Theme {
  if (windowRef?.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.Dark;
  }

  return Theme.Light;
}

export function resolveTheme(document: Document, savedTheme: Theme | null | undefined): Theme {
  if (savedTheme === Theme.Light || savedTheme === Theme.Dark) {
    return savedTheme;
  }

  const { classList } = document.documentElement;

  if (classList.contains(Theme.Dark)) {
    return Theme.Dark;
  }

  return DEFAULT_THEME;
}

export function mapBridgeThemeToAppTheme(value: string | null | undefined, document: Document): Theme | null {
  if (!value) {
    return null;
  }

  switch (value.trim().toUpperCase()) {
    case 'NIGHT':
    case 'DARK':
      return Theme.Dark;
    case 'LIGHT':
      return Theme.Light;
    case 'SYSTEM':
      return resolveSystemTheme(document.defaultView);
    default:
      return null;
  }
}
