import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputOtpComponent } from 'ng-zorro-antd/input';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-otp',
  imports: [FormsModule, NzFormModule, TranslocoDirective, ValidationStatusPipe, NzInputNumberModule, NzInputOtpComponent],
  templateUrl: './input-otp.html',
  styleUrl: './input-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtp extends ControlBaseDirective<string> {
  value = model('');
}
