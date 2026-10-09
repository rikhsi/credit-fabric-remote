import { ChangeDetectionStrategy, Component, ElementRef, NgZone, inject, input, output, signal } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';

const PULL_THRESHOLD = 72;
const MAX_PULL = 112;

export interface RefresherEvent {
  complete: () => void;
}

@Component({
  selector: 'cf-refresher',
  imports: [NzIconDirective],
  templateUrl: './refresher.html',
  styleUrl: './refresher.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-pulling]': 'pull() > 0',
    '[class.is-refreshing]': 'refreshing()',
  },
})
export class Refresher {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);

  readonly disabled = input(false);
  readonly refresh = output<RefresherEvent>();

  readonly pull = signal(0);
  readonly refreshing = signal(false);

  private startY = 0;
  private startX = 0;
  private tracking = false;
  private pulling = false;

  constructor() {
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('touchstart', this.onTouchStart, { passive: true });
      this.host.addEventListener('touchmove', this.onTouchMove, { passive: false });
      this.host.addEventListener('touchend', this.onTouchEnd, { passive: true });
      this.host.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    });
  }

  private readonly onTouchStart = (event: TouchEvent): void => {
    if (this.disabled() || this.refreshing() || event.touches.length !== 1 || this.scrollTop() > 0) {
      this.tracking = false;
      return;
    }

    this.startY = event.touches[0].clientY;
    this.startX = event.touches[0].clientX;
    this.tracking = true;
    this.pulling = false;
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    if (!this.tracking || this.refreshing()) {
      return;
    }

    const touch = event.touches[0];
    const deltaY = touch.clientY - this.startY;
    const deltaX = touch.clientX - this.startX;

    if (!this.pulling) {
      if (deltaY < 8 || Math.abs(deltaX) > deltaY || this.scrollTop() > 0) {
        if (deltaY < -8 || Math.abs(deltaX) > 8) {
          this.tracking = false;
        }

        return;
      }

      this.pulling = true;
    }

    event.preventDefault();
    const distance = Math.min(MAX_PULL, deltaY * 0.45);
    this.zone.run(() => this.pull.set(distance));
  };

  private readonly onTouchEnd = (): void => {
    if (!this.tracking) {
      return;
    }

    const distance = this.pull();
    this.tracking = false;
    this.pulling = false;

    if (distance < PULL_THRESHOLD || this.refreshing()) {
      this.zone.run(() => this.pull.set(0));
      return;
    }

    this.zone.run(() => {
      this.pull.set(0);
      this.refreshing.set(true);
      this.refresh.emit({ complete: () => this.finish() });
    });
  };

  private finish(): void {
    this.refreshing.set(false);
    this.pull.set(0);
  }

  private scrollTop(): number {
    let node: HTMLElement | null = this.host.parentElement;

    while (node) {
      const { overflowY } = getComputedStyle(node);

      if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight + 1) {
        return node.scrollTop;
      }

      node = node.parentElement;
    }

    return window.scrollY || document.documentElement.scrollTop || 0;
  }
}
