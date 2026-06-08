import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })


export class ThemeService {
  private readonly STORAGE_KEY = 'theme';
  isDark = signal(false);

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme  = saved ?? (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(theme);
  }

   toggle() {
    const newTheme = this.isDark() ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }


   private applyTheme(theme: string) {
    this.isDark.set(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

}
