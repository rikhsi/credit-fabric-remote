import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { FlowAddressForm } from '@pages/application/models/form';
import { flowAdressFormModel } from '@pages/application/data/form';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, HandbookPipe, FormField],
  templateUrl: './address-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<FlowAddressForm | null>(NZ_MODAL_DATA, { optional: true });

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
    if (!this.nzModalData) {
      return;
    }

    this.form().value.update((cur) => ({
      ...cur,
      ...this.nzModalData,
    }));
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
