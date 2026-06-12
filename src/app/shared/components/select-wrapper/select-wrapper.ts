import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SelectDefault } from '../select-default/select-default';
import { SelectMobile } from '../select-mobile/select-mobile';
import { Breakpoint } from '@app/constants/breakpoint';
import { ControlBaseDirective } from '@shared/directives';

@Component({
  selector: 'cf-select-wrapper',
  templateUrl: './select-wrapper.html',
  imports: [SelectDefault, SelectMobile],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWrapper extends ControlBaseDirective<number | boolean | string> {
  private readonly breakpointObserver = inject(BreakpointObserver);

  value = model(null);

  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);

  readonly isXs = toSignal(this.breakpointObserver.observe(Breakpoint.XS).pipe(map((state) => state.matches)), {
    initialValue: false,
  });
}
