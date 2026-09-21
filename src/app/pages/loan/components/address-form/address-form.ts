import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { ResetVillageOnCityChangeDirective } from '@pages/loan/directives';
import { HandbookDirective } from '@shared/directives';
import { markTreeAsDirty } from '@shared/utils';
import { createEmptyAddress } from '@pages/loan/utils/address';
import { StartProcessingAddress } from '@api/models/los/start-processing';
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
export class AddressForm {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<StartProcessingAddress | null>(NZ_MODAL_DATA, { optional: true });

  public readonly addressForm = form(
    signal<StartProcessingAddress>({ ...createEmptyAddress(), ...(this.nzModalData ?? {}) }),
    (schemaPath) => {
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

  public close(): void {
    this.modalRef.close(null);
  }

  public submit(): void {
    if (this.addressForm().valid()) {
      this.modalRef.close(this.addressForm().value());
      return;
    }

    markTreeAsDirty(this.addressForm);
  }
}
