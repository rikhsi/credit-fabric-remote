import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';
import { coerceBounceDelay } from '@shared/utils';

@Directive({
  selector: '[cfBounce], button[nz-button], a[nz-button]',
  standalone: true,
})
export class BounceDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly delay = input(100, { alias: 'cfBounce', transform: coerceBounceDelay });

  private skipNext = false;
  private pending = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const delayMs = this.delay();

    if (delayMs <= 0 || this.skipNext) {
      this.skipNext = false;
      this.clearPressed();
      return;
    }

    if (this.pending) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.pending = true;
    this.renderer.addClass(this.elementRef.nativeElement, 'cf-bounce--pressed');

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.pending = false;
      this.clearPressed();
      this.skipNext = true;
      this.elementRef.nativeElement.click();
    }, delayMs);
  }

  private clearPressed(): void {
    this.renderer.removeClass(this.elementRef.nativeElement, 'cf-bounce--pressed');

    if (this.timeoutId != null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
