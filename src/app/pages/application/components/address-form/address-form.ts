import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { flowAdressFormModel } from '@pages/application/data/form';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { OnlineStartProcessingAddress } from '@api/models/los/online';

@Component({
  selector: 'cf-address-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField, HandbookPipe],
  templateUrl: './address-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<OnlineStartProcessingAddress | null>(NZ_MODAL_DATA, { optional: true });

  public readonly form = form(
    signal({
      ...flowAdressFormModel,
      ...this.nzModalData,
    }),
    (schemaPath) => {
      disabled(schemaPath.sysAddressTypeId);
      required(schemaPath.dirVillageId);
      required(schemaPath.sysAddressTypeId);
      required(schemaPath.dirCityId);
      required(schemaPath.street);
      required(schemaPath.zipCode);
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
