import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { take } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HSysMonthApiService } from '@api/controllers/handbooks';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/application/pipes/finance-month.pipe';
import { FlowService } from '@pages/application/services';
import { applyFinanceMonthDefaults } from '@pages/application/utils/finance-months';
import { InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-finance-form',
  imports: [
    FinanceMonthPipe,
    InputDefault,
    SelectDefault,
    NzOptionComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    PluralizePipe,
    DatePipe,
  ],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm implements OnInit {
  private readonly flowService = inject(FlowService);
  private readonly hSysMonthApi = inject(HSysMonthApiService);

  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();

  ngOnInit(): void {
    this.hSysMonthApi
      .getAll$({ id: null, name: null, limit: 100, page: 1 })
      .pipe(take(1))
      .subscribe(({ data }) => {
        this.flowService.flowForm().value.update((current) => ({
          ...current,
          finData: applyFinanceMonthDefaults(current.finData, data),
        }));
      });
  }
}
