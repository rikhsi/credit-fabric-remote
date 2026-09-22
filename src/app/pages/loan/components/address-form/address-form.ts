import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { NgTemplateOutlet } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
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
    NzIconDirective,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    NgTemplateOutlet,
    ResetVillageOnCityChangeDirective,
  ],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline]': 'inline()',
  },
})
export class AddressForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nzModalData = inject<StartProcessingAddress | null>(NZ_MODAL_DATA, { optional: true });

  /** Parent loan form tree — when set, fields bind to `addresses` in place (inline step). */
  readonly form = input<NzSafeAny>();
  readonly inline = input(false);

  public readonly isModal = this.modalRef != null;

  private readonly localForm = form(signal<StartProcessingAddress>({ ...createEmptyAddress(), ...(this.nzModalData ?? {}) }), (schemaPath) => {
    disabled(schemaPath.dirVillageId, () => !this.addressForm().dirCityId().value());
    required(schemaPath.dirVillageId);
    required(schemaPath.dirCityId);
    required(schemaPath.street);
  });

  public readonly addressForm = computed(() => this.form()?.addresses ?? this.localForm);

  public readonly villageHandbook = computed<HandbookRequest | null>(() => {
    const cityId = this.addressForm().dirCityId().value();

    return cityId ? { url: 'dir-village', params: { dir_city_id: cityId } } : null;
  });

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    const tree = this.addressForm();

    if (tree().valid()) {
      this.modalRef?.close(tree().value());
      return;
    }

    markTreeAsDirty(tree);
  }

  /** Used by the mobile step flow to validate in-place fields. */
  public validateInline(): boolean {
    const tree = this.addressForm();

    if (tree().valid()) {
      return true;
    }

    markTreeAsDirty(tree);
    return false;
  }
}
