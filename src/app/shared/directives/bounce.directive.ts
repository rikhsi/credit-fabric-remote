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

  private pending = false;
  private passThrough = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const delayMs = this.delay();

    if (this.passThrough) {
      this.passThrough = false;
      return;
    }

    if (delayMs <= 0) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.pending) {
      return;
    }

    this.pending = true;
    this.lockInteraction();
    this.renderer.addClass(this.elementRef.nativeElement, 'cf-bounce--pressed');

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.renderer.removeClass(this.elementRef.nativeElement, 'cf-bounce--pressed');
      this.unlockInteraction();
      this.passThrough = true;

      this.elementRef.nativeElement.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );

      this.pending = false;
    }, delayMs);
  }

  private lockInteraction(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'pointer-events', 'none');
  }

  private unlockInteraction(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'pointer-events');
  }
}
