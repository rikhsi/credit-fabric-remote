import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { form, FormField, required } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormBox, LabelControlSecondary, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { OnlineStartProcessingExtraInformation } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-extra-form',
  styles: `
    .form-fields {
      display: flex;
      flex-direction: column;
      row-gap: 16px;
      width: 100%;
      min-width: 0;
    }
  `,
  imports: [SelectDefault, NzOptionComponent, FormBox, LabelControlSecondary, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './extra-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<OnlineStartProcessingExtraInformation | null>(NZ_MODAL_DATA, { optional: true });

  public readonly form = form(
    signal<OnlineStartProcessingExtraInformation>({
      sectorEconomy: null,
      objectNewFormation: null,
      enterpriseClassfier: null,
      ecologicalImpactCode: null,
    }),
    (schemaPath) => {
      required(schemaPath.ecologicalImpactCode);
      required(schemaPath.enterpriseClassfier);
      required(schemaPath.objectNewFormation);
      required(schemaPath.sectorEconomy);
    },
  );

  ngOnInit(): void {
    setTimeout(() => {
      this.form().value.set({
        sectorEconomy: null,
        objectNewFormation: null,
        enterpriseClassfier: null,
        ecologicalImpactCode: null,
        ...(this.nzModalData ?? {}),
      });
    }, 0);
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
