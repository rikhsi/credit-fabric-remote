import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, required, requiredError, validate } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { markTreeAsDirty } from '@shared/utils';
import { normalizePhoneNumber, toUzFullPhoneDigits } from '@shared/utils/phone';
import { createEmptyContact, normalizeContactForApi, validatePersonName } from '@pages/loan/utils/contacts';
import { ContactFormData } from '@pages/loan/models/contact-form';
import { StartProcessingContact } from '@api/models/los/start-processing';

function toFormContact(contact: StartProcessingContact | null | undefined): StartProcessingContact {
  const value = { ...createEmptyContact(), ...(contact ?? {}) };

  return {
    ...value,
    mobilePhone: normalizePhoneNumber(value.mobilePhone),
  };
}

@Component({
  selector: 'cf-contact-form',
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
  ],
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nzModalData = inject<ContactFormData | StartProcessingContact | null>(NZ_MODAL_DATA, { optional: true });

  private readonly modalData = computed<ContactFormData>(() => {
    const data = this.nzModalData;

    if (!data) {
      return {};
    }

    if ('contact' in data || 'index' in data) {
      return data as ContactFormData;
    }

    return { contact: data as StartProcessingContact };
  });

  public readonly isEdit = computed(() => this.modalData().index != null);

  private readonly localForm = form(signal<StartProcessingContact>(toFormContact(this.modalData().contact)), (schemaPath) => {
    required(schemaPath.firstName);
    required(schemaPath.lastName);
    validate(schemaPath.firstName, ({ value }) => validatePersonName(value()));
    validate(schemaPath.lastName, ({ value }) => validatePersonName(value()));
    required(schemaPath.dirFamilyRelationshipId);
    validate(schemaPath.mobilePhone, ({ value }) => (toUzFullPhoneDigits(value()) ? null : requiredError()));
  });

  public readonly contactForm = this.localForm;

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    const tree = this.contactForm;

    if (tree().valid()) {
      this.modalRef?.close({
        contact: normalizeContactForApi(tree().value()),
        index: this.modalData().index ?? null,
      });
      return;
    }

    markTreeAsDirty(tree);
  }
}
