import { computed, DOCUMENT, Inject, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageItem } from '@app/constants/local-storage';
import { Theme } from '@app/constants/theme';
import { resolveAssetUrl } from '@shared/utils/assets-base-url';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>(Theme.Light);
  readonly nextTheme = computed(() => (this.currentTheme() === Theme.Light ? Theme.Dark : Theme.Light));

  private readonly renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    rendererFactory: RendererFactory2,
    private lsService: LocalStorageService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public setTheme(theme: Theme): Observable<Theme> {
    const prevTheme = this.currentTheme();

    if (prevTheme === theme && this.isThemeLoaded(theme)) {
      this.applyThemeClass(theme);
      this.lsService.setItem(LocalStorageItem.Theme, theme);

      return of(theme);
    }

    return this.loadCss$(theme).pipe(
      tap(() => {
        if (prevTheme && prevTheme !== theme) {
          this.removeTheme(prevTheme);
        }

        this.applyThemeClass(theme);
        this.currentTheme.set(theme);

        this.lsService.setItem(LocalStorageItem.Theme, theme);
      }),
    );
  }

  private applyThemeClass(theme: Theme): void {
    this.renderer.removeClass(this.document.documentElement, Theme.Light);

    if (theme === Theme.Dark) {
      this.renderer.addClass(this.document.documentElement, Theme.Dark);
      return;
    }

    this.renderer.removeClass(this.document.documentElement, Theme.Dark);
  }

  private loadCss$(theme: Theme): Observable<Theme> {
    if (this.isThemeLoaded(theme)) {
      return of(theme);
    }

    return new Observable<Theme>((observer) => {
      const link = this.renderer.createElement('link');

      this.renderer.setAttribute(link, 'rel', 'stylesheet');
      this.renderer.setAttribute(link, 'href', this.getThemeHref(theme));
      this.renderer.setAttribute(link, 'id', theme);

      link.onload = () => {
        observer.next(theme);
        observer.complete();
      };

      link.onerror = (error: Event) => observer.error(error);

      this.renderer.appendChild(this.document.head, link);
    });
  }

  private isThemeLoaded(theme: Theme): boolean {
    return !!this.document.getElementById(theme);
  }

  private getThemeHref(theme: Theme): string {
    return resolveAssetUrl(this.document, `${theme}.css`);
  }

  private removeTheme(theme: Theme): void {
    const link = this.document.getElementById(theme);

    if (link) {
      this.renderer.removeClass(this.document.documentElement, theme);
      this.renderer.removeChild(this.document.head, link);
    }
  }
}
