import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
  ],
  templateUrl: './input-default.html',
  styleUrl: './input-default.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDefault extends ControlBaseDirective<string | null> {
  value = model(null);
  prefix = input<string>();
  suffix = input<string>();

  mask = input<string | undefined>('');
  maskPrefix = input<string | undefined>('');
}
