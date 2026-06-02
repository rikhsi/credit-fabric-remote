import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { FlowFinanceForm } from '@pages/application/models/form';
import { flowFinanceFormModel } from '@pages/application/data/form';

@Component({
  selector: 'cf-finance-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<FlowFinanceForm | null>(NZ_MODAL_DATA, { optional: true });

  public readonly form = form(signal(flowFinanceFormModel), (schemaPath) => {
    required(schemaPath.companyActivity);
    required(schemaPath.activityTerm);
    required(schemaPath.month1);
    required(schemaPath.month1Revenue);
    required(schemaPath.month1Income);
    required(schemaPath.month2);
    required(schemaPath.month2Revenue);
    required(schemaPath.month2Income);
    required(schemaPath.month3);
    required(schemaPath.month3Revenue);
    required(schemaPath.month3Income);
  });

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    if (!this.nzModalData) {
      return;
    }

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
