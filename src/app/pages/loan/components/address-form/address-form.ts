import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { ResetVillageOnCityChangeDirective } from '@pages/loan/directives';
import { HandbookDirective } from '@shared/directives';
import { markTreeAsDirty } from '@shared/utils';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';
import { HandbookRequest } from '@app/typings/handbook';

@Component({
  selector: 'cf-address-form',
  imports: [
    FormBox,
    InputDefault,
    LabelControlSecondary,
    SelectDefault,
    SelectDefaultMobile,
    NzOptionComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    ResetVillageOnCityChangeDirective,
  ],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnInit {
  private isLoading = signal<boolean>(true);
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<OnlineStartProcessingAddress | null>(NZ_MODAL_DATA, { optional: true });

  public readonly addressForm = form(
    signal<OnlineStartProcessingAddress>({
      sysAddressTypeId: null,
      dirCityId: null,
      dirVillageId: null,
      street: null,
      zipCode: null,
      dirCountryId: null,
    }),
    (schemaPath) => {
      disabled(schemaPath, () => this.isLoading());
      disabled(schemaPath.dirVillageId, () => !this.addressForm.dirCityId().value());
      required(schemaPath.dirVillageId);
      required(schemaPath.dirCityId);
      required(schemaPath.street);
    },
  );

  public readonly villageHandbook = computed<HandbookRequest | null>(() => {
    const cityId = this.addressForm.dirCityId().value();

    return cityId ? { url: 'dir-village', params: { dir_city_id: cityId } } : null;
  });

  public ngOnInit(): void {
    setTimeout(() => {
      this.addressForm().value.update(() => ({
        sysAddressTypeId: this.nzModalData.sysAddressTypeId,
        dirCityId: this.nzModalData.dirCityId,
        dirVillageId: this.nzModalData.dirVillageId,
        street: this.nzModalData.street,
        zipCode: this.nzModalData.zipCode,
        dirCountryId: this.nzModalData.dirCountryId,
      }));

      this.isLoading.set(false);
    }, 0);
  }

  public close(): void {
    this.modalRef.close(null);
  }

  public submit(): void {
    if (this.addressForm().disabled()) {
      return;
    }

    if (this.addressForm().valid()) {
      this.modalRef.close(this.addressForm().value());
      return;
    }

    markTreeAsDirty(this.addressForm);
  }
}
