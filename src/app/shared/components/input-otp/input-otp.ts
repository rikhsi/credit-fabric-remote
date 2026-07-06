import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputOtpComponent } from 'ng-zorro-antd/input';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-otp',
  imports: [FormsModule, NzFormModule, TranslocoDirective, ValidationStatusPipe, ValidationMsgPipe, NzInputOtpComponent],
  templateUrl: './input-otp.html',
  styleUrl: './input-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtp extends ControlBaseDirective<string> {
  value = model('');

  protected readonly otpFormatter = (value: string): string => value.replace(/\D/g, '').slice(-1);

  readonly visibleError = computed(() => {
    const error = this.firstError();
    const kind = error?.kind;

    if (!kind || kind === 'required' || kind === 'minLength' || kind === 'maxLength') {
      return null;
    }

    return error;
  });
}
