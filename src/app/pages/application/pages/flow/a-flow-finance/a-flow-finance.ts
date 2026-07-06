import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { Card, Steps } from '@shared/components';
import { FlowService } from '@pages/application/services';
import { ApplicationFlowRoute } from '@app/constants/route-path';
import { FinanceForm } from '@pages/application/components/finance-form/finance-form';
import { isFinanceStepValid } from '@pages/application/utils/flow-step.validation';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-a-flow-finance',
  imports: [NzButtonComponent, FinanceForm, Card, Steps, TranslocoDirective, BounceDirective],
  templateUrl: './a-flow-finance.html',
  styleUrl: './a-flow-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowFinance {
  private flowService = inject(FlowService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  continue(): void {
    if (isFinanceStepValid(this.flowService.flowForm)) {
      void this.router.navigate([ApplicationFlowRoute.OneId], { relativeTo: this.route.parent });
      return;
    }

    this.markFinanceFormDirty();
    this.scrollToInvalidElement();
  }

  private markFinanceFormDirty(): void {
    const { finData } = this.flowForm();

    finData.dirCompanyActivityId().markAsDirty();
    finData.activityTerm().markAsDirty();
    finData.month1Revenue().markAsDirty();
    finData.month1Income().markAsDirty();
    finData.month2Revenue().markAsDirty();
    finData.month2Income().markAsDirty();
    finData.month3Revenue().markAsDirty();
    finData.month3Income().markAsDirty();
  }

  private scrollToInvalidElement(): void {
    setTimeout(() => {
      const el = document.querySelector('.ant-form-item-explain-error');

      if (el) {
        (el as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
  }
}
