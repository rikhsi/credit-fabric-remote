import { DestroyRef, Directive, ElementRef, NgZone, inject, input, output } from '@angular/core';

const EDGE_WIDTH = 28;
const DRAG_START_THRESHOLD = 8;
const CLOSE_DISTANCE = 100;
const CLOSE_VELOCITY_DISTANCE = 40;
const CLOSE_VELOCITY = 0.45;
const CLOSE_DURATION = 220;

function coerceSwipeBackEnabled(value: boolean | string | number | null | undefined): boolean {
  if (value === false || value === 0 || value === 'false' || value === '0') {
    return false;
  }

  return true;
}

@Directive({
  selector: '[cfSwipeBack]',
  standalone: true,
})
export class SwipeBackDirective {
  private readonly host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly zone = inject(NgZone);

  readonly enabled = input(true, { alias: 'cfSwipeBack', transform: coerceSwipeBackEnabled });
  readonly swiped = output<void>();

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
      this.clearTransform(host);

      if (this.resetTimeoutId) {
        clearTimeout(this.resetTimeoutId);
      }
    });
  }

  private readonly onTouchStart = (event: TouchEvent): void => {
    if (!this.enabled() || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    // iOS-style edge swipe: only start from the left side of the screen.
    if (touch.clientX > EDGE_WIDTH) {
      return;
    }

    this.tracking = true;
    this.dragging = false;
    this.offset = 0;
    this.startY = touch.clientY;
    this.startX = touch.clientX;
    this.startTime = Date.now();

    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    if (!this.tracking) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    if (!this.dragging) {
      if (deltaX < DRAG_START_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) {
        if (deltaX < -DRAG_START_THRESHOLD || Math.abs(deltaY) > DRAG_START_THRESHOLD) {
          this.tracking = false;
        }

        return;
      }

      this.dragging = true;
      this.host.style.transition = 'none';
    }

    event.preventDefault();

    this.offset = Math.max(0, deltaX);
    this.host.style.transform = `translateX(${this.offset}px)`;
  };

  private readonly onTouchEnd = (): void => {
    if (!this.tracking) {
      return;
    }

    const wasDragging = this.dragging;
    const velocity = this.offset / Math.max(1, Date.now() - this.startTime);

    this.tracking = false;
    this.dragging = false;

    if (!wasDragging) {
      return;
    }

    const shouldGoBack =
      this.offset > CLOSE_DISTANCE || (this.offset > CLOSE_VELOCITY_DISTANCE && velocity > CLOSE_VELOCITY);

    this.host.style.transition = `transform ${CLOSE_DURATION}ms ease`;

    if (!shouldGoBack) {
      this.host.style.transform = 'translateX(0)';
      this.resetTimeoutId = setTimeout(() => this.clearTransform(this.host), CLOSE_DURATION);
      return;
    }

    this.host.style.transform = 'translateX(100%)';
    this.resetTimeoutId = setTimeout(() => this.clearTransform(this.host), CLOSE_DURATION);
    this.zone.run(() => this.swiped.emit());
  };

  private clearTransform(host: HTMLElement): void {
    this.resetTimeoutId = null;
    host.style.transition = '';
    host.style.transform = '';
  }
}
