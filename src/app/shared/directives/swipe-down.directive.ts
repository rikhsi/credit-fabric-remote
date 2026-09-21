import { DestroyRef, Directive, ElementRef, NgZone, inject, input, output } from '@angular/core';

const DRAG_START_THRESHOLD = 6;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY_DISTANCE = 40;
const CLOSE_VELOCITY = 0.5;
const CLOSE_DURATION = 240;

@Directive({
  selector: '[cfSwipeDown]',
  standalone: true,
})
export class SwipeDownDirective {
  private readonly host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly zone = inject(NgZone);

  readonly panelSelector = input('.ant-drawer-content-wrapper', { alias: 'cfSwipeDown' });
  readonly swiped = output<void>();

  private panel: HTMLElement | null = null;
  private startY = 0;
  private startX = 0;
  private startTime = 0;
  private offset = 0;
  private dragging = false;
  private tracking = false;
  private resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const host = this.host;

    this.zone.runOutsideAngular(() => {
      host.addEventListener('touchstart', this.onTouchStart, { passive: true });
      host.addEventListener('touchmove', this.onTouchMove, { passive: false });
      host.addEventListener('touchend', this.onTouchEnd, { passive: true });
      host.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    });

    inject(DestroyRef).onDestroy(() => {
      host.removeEventListener('touchstart', this.onTouchStart);
      host.removeEventListener('touchmove', this.onTouchMove);
      host.removeEventListener('touchend', this.onTouchEnd);
      host.removeEventListener('touchcancel', this.onTouchEnd);

      if (this.resetTimeoutId) {
        clearTimeout(this.resetTimeoutId);
      }
    });
  }

  private readonly onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1 || this.isInsideScrolledArea(event.target)) {
      return;
    }

    const touch = event.touches[0];

    this.tracking = true;
    this.dragging = false;
    this.offset = 0;
    this.startY = touch.clientY;
    this.startX = touch.clientX;
    this.startTime = Date.now();
    this.panel = this.host.closest<HTMLElement>(this.panelSelector());

    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    if (!this.tracking || !this.panel) {
      return;
    }

    const touch = event.touches[0];
    const deltaY = touch.clientY - this.startY;
    const deltaX = touch.clientX - this.startX;

    if (!this.dragging) {
      if (deltaY < DRAG_START_THRESHOLD || Math.abs(deltaY) <= Math.abs(deltaX)) {
        if (deltaY < -DRAG_START_THRESHOLD || Math.abs(deltaX) > DRAG_START_THRESHOLD) {
          this.tracking = false;
        }

        return;
      }

      this.dragging = true;
      this.panel.style.transition = 'none';
    }

    event.preventDefault();

    this.offset = Math.max(0, deltaY);
    this.panel.style.transform = `translateY(${this.offset}px)`;
  };

  private readonly onTouchEnd = (): void => {
    if (!this.tracking || !this.panel) {
      this.tracking = false;

      return;
    }

    const panel = this.panel;
    const wasDragging = this.dragging;
    const velocity = this.offset / Math.max(1, Date.now() - this.startTime);

    this.tracking = false;
    this.dragging = false;

    if (!wasDragging) {
      return;
    }

    const shouldClose = this.offset > CLOSE_DISTANCE || (this.offset > CLOSE_VELOCITY_DISTANCE && velocity > CLOSE_VELOCITY);

    panel.style.transition = `transform ${CLOSE_DURATION}ms ease`;
    panel.style.transform = shouldClose ? 'translateY(100%)' : 'translateY(0)';

    this.resetTimeoutId = setTimeout(() => {
      this.resetTimeoutId = null;
      panel.style.transition = '';

      // A closed panel keeps `translateY(100%)` so the drawer can slide it back in on the next open.
      if (!shouldClose) {
        panel.style.transform = '';
      }
    }, CLOSE_DURATION);

    if (shouldClose) {
      this.zone.run(() => this.swiped.emit());
    }
  };

  private isInsideScrolledArea(target: EventTarget | null): boolean {
    let node = target instanceof HTMLElement ? target : null;

    while (node && node !== this.host) {
      if (node.scrollHeight > node.clientHeight + 1 && node.scrollTop > 0) {
        return true;
      }

      node = node.parentElement;
    }

    return false;
  }
}
