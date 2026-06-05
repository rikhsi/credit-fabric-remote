import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { flowAdressFormModel } from '@pages/application/data/form';
import { isFlowAddressFilled } from '@pages/application/utils/address';
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
export class AddressForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<OnlineStartProcessingAddress | null>(NZ_MODAL_DATA, { optional: true });

  private readonly initialValue: OnlineStartProcessingAddress = {
    ...flowAdressFormModel,
    dirCountryId: 'UZB',
    ...(this.nzModalData ?? {}),
  };

  public readonly addressForm = form(signal(this.initialValue), (schemaPath) => {
    disabled(schemaPath.sysAddressTypeId);
    required(schemaPath.dirVillageId);
    required(schemaPath.dirCityId);
    required(schemaPath.street);
    required(schemaPath.zipCode);
  });

  public readonly submitDisabled = computed(() => !this.addressForm().valid());

  public readonly isEdit = computed(() => isFlowAddressFilled(this.initialValue));

  ngOnInit(): void {
    this.addressForm().value.set(this.initialValue);
  }

  public close(): void {
    this.modalRef.close(null);
  }

  public submit(): void {
    if (this.addressForm().valid()) {
      this.modalRef.close(this.addressForm().value());
      return;
    }

    this.addressForm().markAsDirty();
  }
}
