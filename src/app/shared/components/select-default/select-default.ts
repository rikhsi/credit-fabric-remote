import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-select-default',
  templateUrl: './select-default.html',
  styleUrl: './select-default.less',
  imports: [NzSelectModule, FormsModule, NzIconModule, NzFormModule, TranslocoDirective, ValidationStatusPipe, ValidationMsgPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDefault extends ControlBaseDirective<number | boolean | string> {
  value = model(null);

  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);
}
