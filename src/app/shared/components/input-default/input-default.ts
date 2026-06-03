import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgxMaskDirective } from 'ngx-mask';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputWrapperComponent } from 'ng-zorro-antd/input';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-default',
  imports: [
    NgxMaskDirective,
    NzInputWrapperComponent,
    NzInputDirective,
    NzFormModule,
    TranslocoDirective,
    ValidationStatusPipe,
    ValidationMsgPipe,
  ],
  templateUrl: './input-default.html',
  styleUrl: './input-default.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDefault extends ControlBaseDirective<string | null> {
  prefix = input<string>();
  suffix = input<string>();

  mask = input<string | undefined>();
  maskPrefix = input<string | undefined>();

  /** Read-only label shown instead of the bound form value (e.g. handbook name). */
  displayValue = input<string | null>(null);

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    const current = this.value() ?? '';

    if (next === current) {
      return;
    }

    this.value.set(next || null);
  }
}
