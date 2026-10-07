import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { form, FormField, required, requiredError, validate } from '@angular/forms/signals';
import { NgTemplateOutlet } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
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
    NzIconDirective,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    NgTemplateOutlet,
  ],
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline]': 'inline()',
  },
})
export class ContactForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nzModalData = inject<ContactFormData | StartProcessingContact | null>(NZ_MODAL_DATA, { optional: true });

  /** Parent loan form tree — when set, fields bind to `contacts[index]` in place (inline step). */
  readonly form = input<NzSafeAny>();
  readonly index = input(0);
  readonly inline = input(false);

  public readonly isModal = this.modalRef != null;

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

  public readonly contactForm = computed(() => {
    const parent = this.form();

    if (parent) {
      return parent.contacts[this.index()];
    }

    return this.localForm;
  });

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    const tree = this.contactForm();

    if (tree().valid()) {
      this.modalRef?.close({
        contact: normalizeContactForApi(tree().value()),
        index: this.modalData().index ?? null,
      });
      return;
    }

    markTreeAsDirty(tree);
  }

  /** Used by the mobile step flow to validate in-place fields. */
  public validateInline(): boolean {
    const tree = this.contactForm();

    if (tree().valid()) {
      return true;
    }

    markTreeAsDirty(tree);
    return false;
  }
}
