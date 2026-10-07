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
import { createEmptyContact, normalizeContactForApi } from '@pages/loan/utils/contacts';
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
  private readonly nzModalData = inject<StartProcessingContact | null>(NZ_MODAL_DATA, { optional: true });

  /** Parent loan form tree — when set, fields bind to `contacts` in place (inline step). */
  readonly form = input<NzSafeAny>();
  readonly inline = input(false);

  public readonly isModal = this.modalRef != null;

  private readonly localForm = form(signal<StartProcessingContact>(toFormContact(this.nzModalData)), (schemaPath) => {
    required(schemaPath.firstName);
    required(schemaPath.lastName);
    required(schemaPath.dirFamilyRelationshipId);
    validate(schemaPath.mobilePhone, ({ value }) => (toUzFullPhoneDigits(value()) ? null : requiredError()));
  });

  public readonly contactForm = computed(() => this.form()?.contacts ?? this.localForm);

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    const tree = this.contactForm();

    if (tree().valid()) {
      this.modalRef?.close(normalizeContactForApi(tree().value()));
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
