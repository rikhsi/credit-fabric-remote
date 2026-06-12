import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, contentChildren, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SelectBottomSheet } from '../select-bottom-sheet/select-bottom-sheet';
import { SelectBottomSheetOption } from '../select-bottom-sheet/select-option';
import { Breakpoint } from '@app/constants/breakpoint';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

function readOptionField<T>(field: T | (() => T) | undefined): T | undefined {
  if (typeof field === 'function') {
    return (field as () => T)();
  }

  return field;
}

function mapNzOptions(options: readonly NzOptionComponent[]): SelectBottomSheetOption[] {
  return options.map((option) => {
    const value = readOptionField(option.nzValue) as string | number | boolean;
    const label = String(readOptionField(option.nzLabel) ?? value ?? '');

    return { value, label };
  });
}

@Component({
  selector: 'cf-select-default',
  templateUrl: './select-default.html',
  styleUrl: './select-default.less',
  imports: [
    NzSelectModule,
    FormsModule,
    NzIconModule,
    NzFormModule,
    TranslocoDirective,
    ValidationStatusPipe,
    ValidationMsgPipe,
    SelectBottomSheet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDefault extends ControlBaseDirective<number | boolean | string> {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly optionList = contentChildren(NzOptionComponent);
  value = model(null);

  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);

  readonly isXs = toSignal(this.breakpointObserver.observe(Breakpoint.XS).pipe(map((state) => state.matches)), {
    initialValue: false,
  });

  readonly selectOptions = computed(() => mapNzOptions(this.optionList()));
}
