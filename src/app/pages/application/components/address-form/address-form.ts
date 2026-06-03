import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FlowAddressForm } from '@pages/application/models/form';
import { flowAdressFormModel } from '@pages/application/data/form';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './address-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<FlowAddressForm | null>(NZ_MODAL_DATA, { optional: true });

  public readonly form = form(
    signal({
      ...flowAdressFormModel,
      ...this.nzModalData,
    }),
    (schemaPath) => {
      disabled(schemaPath.addressType);
      required(schemaPath.address);
      required(schemaPath.addressType);
      required(schemaPath.city);
      required(schemaPath.street);
      required(schemaPath.postalCode);
    },
  );

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
