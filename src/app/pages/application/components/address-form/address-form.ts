import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent],
  templateUrl: './address-form.html',
  styleUrl: './address-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm {
  modalRef = inject(NzModalRef);
}
