import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { form, FormField, required } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormBox, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { FlowExtraInformationForm } from '@pages/application/models/form';
import { flowExtraInformationFormModel } from '@pages/application/data/form';

@Component({
  selector: 'cf-general-form',
  imports: [SelectDefault, NzOptionComponent, FormBox, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './general-form.html',
  styleUrl: './general-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<FlowExtraInformationForm>(NZ_MODAL_DATA);

  public readonly form = form(signal(flowExtraInformationFormModel), (schemaPath) => {
    required(schemaPath.ecologicalImpactCode);
    required(schemaPath.enterpriseClassifier);
    required(schemaPath.objectNewFormation);
    required(schemaPath.sectorEconomy);
  });

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form().value.update((cur) => ({
      ...cur,
      ...this.nzModalData,
    }));
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
