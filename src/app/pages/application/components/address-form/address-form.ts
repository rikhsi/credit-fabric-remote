import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, LabelControlSecondary, SelectWrapper } from '@shared/components';
import { ResetVillageOnCityChangeDirective } from '@pages/application/directives';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-address-form',
  imports: [
    FormBox,
    InputDefault,
    LabelControlSecondary,
    SelectWrapper,
    NzOptionComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    HandbookPipe,
    ResetVillageOnCityChangeDirective,
  ],
  templateUrl: './address-form.html',
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
      required(schemaPath.dirVillageId);
      required(schemaPath.dirCityId);
      required(schemaPath.street);
      required(schemaPath.zipCode);
    },
  );

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
    if (this.addressForm().valid()) {
      this.modalRef.close(this.addressForm().value());
      return;
    }

    this.addressForm().markAsDirty();
  }
}
