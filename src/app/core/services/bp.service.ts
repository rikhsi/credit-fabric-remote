import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Breakpoint } from '@app/constants/breakpoint';

@Injectable({
  providedIn: 'root',
})
export class BpService {
  #points = [Breakpoint.MOBILE, Breakpoint.TABLET, Breakpoint.DESKTOP];

  readonly isMobile = signal<boolean>(false);
  readonly isTablet = signal<boolean>(false);
  readonly isDesktop = signal<boolean>(false);

  constructor(private breakpointObserver: BreakpointObserver) {}

  observe$(): Observable<BreakpointState> {
    return this.breakpointObserver.observe(this.#points).pipe(
      tap((state) => {
        this.isMobile.set(state.breakpoints[Breakpoint.MOBILE]);
        this.isTablet.set(state.breakpoints[Breakpoint.TABLET]);
        this.isDesktop.set(state.breakpoints[Breakpoint.DESKTOP]);
      }),
    );
  }
}
