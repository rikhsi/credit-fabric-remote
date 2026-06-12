import { Directive, ElementRef, HostListener, inject, input, output, Renderer2 } from '@angular/core';
import { coerceBounceDelay } from '@shared/utils';

@Directive({
  selector: '[cfBounce]',
  standalone: true,
})
export class BounceDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly delay = input(100, { alias: 'cfBounce', transform: coerceBounceDelay });
  readonly clicked = output<void>();

  private pending = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const delayMs = this.delay();

    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.pending) {
      return;
    }

    if (delayMs <= 0) {
      this.clicked.emit();
      return;
    }

    this.pending = true;
    this.renderer.setStyle(this.elementRef.nativeElement, 'pointer-events', 'none');
    this.renderer.addClass(this.elementRef.nativeElement, 'cf-bounce--pressed');

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.pending = false;
      this.renderer.removeClass(this.elementRef.nativeElement, 'cf-bounce--pressed');
      this.renderer.removeStyle(this.elementRef.nativeElement, 'pointer-events');
      this.clicked.emit();
    }, delayMs);
  }
}
