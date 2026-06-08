import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { StatementFormStore } from '../../features/payroll/statement-form/statement-form.store';
import { DecimalPipe } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-salary-statement-summary',
  imports: [
    IconComponent,
    TranslateModule,
    NgxMaskPipe
  ],
  templateUrl: './salary-statement-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryStatementSummaryComponent {
  submit = output<void>();

  readonly store = inject(StatementFormStore);
}
