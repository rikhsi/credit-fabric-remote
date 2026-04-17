import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './address-form.html',
  styleUrl: './address-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm {
  modalRef = inject(NzModalRef);

  formModel = signal<{ city: number }>({
    city: null,
  });

  form = form(this.formModel);
}
