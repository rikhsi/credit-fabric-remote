import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBox, SelectDefault } from '@shared/components';

@Component({
  selector: 'cf-general-form',
  imports: [SelectDefault, NzOptionComponent, FormBox, TranslocoDirective],
  templateUrl: './general-form.html',
  styleUrl: './general-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralForm {
  modalRef = inject(NzModalRef);
}
