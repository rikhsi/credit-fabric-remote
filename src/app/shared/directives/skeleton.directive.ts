import { Directive, ElementRef, Renderer2, effect, OnDestroy, model, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[cfSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements AfterViewInit, OnDestroy {
  readonly isLoading = model<boolean | null>(null, { alias: 'cfSkeleton' });

  private loadUnlisten?: () => void;
  private errorUnlisten?: () => void;

  get host() {
    return this.el.nativeElement;
  }

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
    effect(() => {
      if (this.isLoading()) {
        this.renderer.addClass(this.host, 'cf-skeleton-host');
      } else {
        this.renderer.removeClass(this.host, 'cf-skeleton-host');
      }
    });
  }

  ngAfterViewInit() {
    this.initImage();
  }

  ngOnDestroy() {
    this.loadUnlisten?.();
    this.errorUnlisten?.();
  }

  private initImage(): void {
    const isImg = this.host.tagName === 'IMG';

    if (isImg) {
      const img = this.host as HTMLImageElement;

      if (img.complete && img.naturalWidth > 0) {
        this.isLoading.set(false);
      } else {
        this.isLoading.set(true);

        this.loadUnlisten = this.renderer.listen(img, 'load', () => {
          this.isLoading.set(false);
        });

        this.errorUnlisten = this.renderer.listen(img, 'error', () => {
          this.isLoading.set(true);
        });
      }
    }
  }
}
