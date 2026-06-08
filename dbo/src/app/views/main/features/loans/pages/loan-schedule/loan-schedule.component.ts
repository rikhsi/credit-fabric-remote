import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { PageLayoutComponent } from '../../../../../../shared/components/page-layout/page-layout.component';
import { LoanService } from '../../services/loan.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from "@angular/common";

@Component({
  selector: 'app-loan-schedule',
  imports: [PageLayoutComponent, DecimalPipe],
  templateUrl: './loan-schedule.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanScheduleComponent {
  private readonly loanService = inject(LoanService);

  public readonly schedule: Signal<any> = toSignal(
    this.loanService.getMockLoanSchedule('')
  );
}
