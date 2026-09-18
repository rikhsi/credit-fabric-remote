import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputSuffixDirective, NzInputWrapperComponent } from 'ng-zorro-antd/input';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

function isBlank(value: unknown): boolean {
  return value == null || value === '';
}

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
    FormsModule,
    NzInputSuffixDirective,
  ],
  templateUrl: './input-default.html',
  styleUrl: './input-default.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDefault extends ControlBaseDirective<string | null> {
  value = model(null);
  prefix = input<string>();
  suffix = input<string>();
  type = input<string>('text');

  mask = input<string>('');
  maskPrefix = input<string>('');
  thousandSeparator = input<string>('');

  onValueChange(next: string | null): void {
    const current = this.value();

    /** ngx-mask echoes the value back on init, which would mark an untouched field as dirty. */
    if (next === current || (isBlank(next) && isBlank(current))) {
      return;
    }

    this.value.set(next);
  }
}
