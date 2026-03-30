import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-number',
  imports: [FormsModule, NzFormModule, TranslocoDirective, ValidationStatusPipe, ValidationMsgPipe, NzInputNumberModule],
  templateUrl: './input-number.html',
  styleUrl: './input-number.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumber extends ControlBaseDirective<number> {
  readonly minVal = input<number>();
  readonly maxVal = input<number>();
}
