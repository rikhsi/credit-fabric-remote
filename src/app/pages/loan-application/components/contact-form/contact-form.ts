import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';

@Component({
  selector: 'cf-contact-form',
  imports: [SelectDefault, NzOptionComponent, FormBox, InputDefault],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  modalRef = inject(NzModalRef);
}
