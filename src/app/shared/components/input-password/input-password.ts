import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-password',
  imports: [FormsModule, NzFormModule, NzIconDirective, NzInputModule, TranslocoDirective, ValidationMsgPipe, ValidationStatusPipe],
  templateUrl: './input-password.html',
  styleUrl: './input-password.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPassword extends ControlBaseDirective<string> {
  showIcon = input<string>('eye');
  hideIcon = input<string>('eye-invisible');
}
