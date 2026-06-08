import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '../../../shared/components/page-layout/page-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  StatementEmployeesComponent
} from '../../../features/payroll/statement-employees/statement-employees.component';
import { StatementEmployeesStore } from '../../../features/payroll/statement-employees/statement-employees.store';

@Component({
  selector: 'app-statement-employees-page',
  imports: [
    PageLayoutComponent,
    TranslateModule,
    StatementEmployeesComponent
  ],
  providers: [StatementEmployeesStore],

  templateUrl: './statement-employees-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementEmployeesPageComponent {

}
