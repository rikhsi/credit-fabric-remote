import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

interface NativeEvent {
  type: string;
  payload?: NzSafeAny;
}

@Injectable()
export class NativeBridgeService implements OnDestroy {
  private events$ = new Subject<NativeEvent>();

  private nativeHandler?: (data: NzSafeAny) => void;
  private messageHandler?: (event: MessageEvent) => void;

  get win() {
    return window as NzSafeAny;
  }

  constructor(private zone: NgZone) {
    this.initListener();
  }

  postMessage<T>(msg: T): void {
    const win = window as NzSafeAny;
    const payload = JSON.stringify(msg);

    win?.Bridge?.postMessage?.(payload);
    win?.webkit?.messageHandlers?.Bridge?.postMessage?.(payload);
  }

  on<T>(type: string): Observable<T> {
    return this.events$.pipe(
      filter((event) => event.type === type),
      map((event) => event.payload as T),
    );
  }

  all(): Observable<NativeEvent> {
    return this.events$.asObservable();
  }

  private initListener(): void {
    this.nativeHandler = (data: NzSafeAny) => {
      this.handleMessage(data);
    };

    this.messageHandler = (event: MessageEvent) => {
      this.handleMessage(event.data);
    };

    if (this.win) {
      this.win.onNativeMessage = this.nativeHandler;
      this.win.addEventListener('message', this.messageHandler);
    }
  }

  private handleMessage(data: NzSafeAny): void {
    this.zone.run(() => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        if (!parsed?.type) return;

        this.events$.next(parsed);
      } catch {
        console.warn('Invalid native message:', data);
      }
    });
  }
  private destroyListeners(): void {
    const win = window as NzSafeAny;

    if (this.nativeHandler && win.onNativeMessage === this.nativeHandler) {
      win.onNativeMessage = undefined;
    }

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
  }

  ngOnDestroy(): void {
    this.destroyListeners();
    this.events$.complete();
  }
}
