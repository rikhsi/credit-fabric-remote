import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-finance-form',
  imports: [],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm {}
