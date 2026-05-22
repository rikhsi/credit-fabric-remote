import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { FlowAddressForm } from '@pages/application/models/form';
import { flowAdressFormModel } from '@pages/application/data/form';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './address-form.html',
  styleUrl: './address-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<FlowAddressForm>(NZ_MODAL_DATA);

  public readonly form = form(signal(flowAdressFormModel), (schemaPath) => {
    disabled(schemaPath.addressType);
    required(schemaPath.address);
    required(schemaPath.addressType);
    required(schemaPath.city);
    required(schemaPath.street);
    required(schemaPath.postalCode);
  });

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form().value.update((cur) => ({
      ...cur,
      ...this.nzModalData,
    }));

    this.form.address().reset();
  }

  public close(): void {
    this.modalRef.close(null);
  }

  public submit(): void {
    if (this.form().valid()) {
      this.modalRef.close(this.form().value());
    } else {
      this.form().markAsDirty();
    }
  }
}
