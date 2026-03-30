import { Directive, effect, Inject, input, OnDestroy, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[cfLockScroll]',
  standalone: true,
})
export class LockScrollDirective implements OnDestroy {
  readonly lockScroll = input<boolean>(false, { alias: 'cfLockScroll' });

  get body() {
    return this.document.body;
  }

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    effect(() => {
      if (this.lockScroll()) {
        this.enable();
      } else {
        this.disable();
      }
    });
  }

  private enable(): void {
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  private disable(): void {
    this.renderer.removeStyle(this.body, 'overflow');
  }

  ngOnDestroy(): void {
    this.disable();
  }
}
