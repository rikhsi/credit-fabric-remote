import { computed, DOCUMENT, Inject, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageItem } from '@app/constants/local-storage';
import { Theme } from '@app/constants/theme';

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

    if (prevTheme === theme) {
      this.lsService.setItem(LocalStorageItem.Theme, theme);

      return of(theme);
    }

    return this.loadCss$(theme).pipe(
      tap(() => {
        if (prevTheme) {
          this.removeTheme(prevTheme);
        }

        this.renderer.addClass(this.document.documentElement, theme);
        this.currentTheme.set(theme);

        this.lsService.setItem(LocalStorageItem.Theme, theme);
      }),
    );
  }

  private loadCss$(theme: Theme): Observable<Theme> {
    if (this.document.getElementById(theme)) {
      return of(theme);
    }

    return new Observable<Theme>((observer) => {
      const link = this.renderer.createElement('link');

      this.renderer.setAttribute(link, 'rel', 'stylesheet');
      this.renderer.setAttribute(link, 'href', `${theme}.css`);
      this.renderer.setAttribute(link, 'id', theme);

      link.onload = () => {
        observer.next(theme);
        observer.complete();
      };

      link.onerror = (error: Event) => observer.error(error);

      this.renderer.appendChild(this.document.head, link);
    });
  }

  private removeTheme(theme: Theme): void {
    const link = this.document.getElementById(theme);

    if (link) {
      this.renderer.removeClass(this.document.documentElement, theme);
      this.renderer.removeChild(this.document.head, link);
      this.lsService.removeItem(LocalStorageItem.Theme);
    }
  }
}
