import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    NzFormModule,
    TranslocoDirective,
    ValidationStatusPipe,
    ValidationMsgPipe,
  ],
  templateUrl: './input-default.html',
  styleUrl: './input-default.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDefault extends ControlBaseDirective<string> {
  prefix = input<string>();
  suffix = input<string>();

  mask = input<string | undefined>();
  maskPrefix = input<string | undefined>();
}
