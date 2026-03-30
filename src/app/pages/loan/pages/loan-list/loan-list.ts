import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardProduct } from '@pages/loan/components';

@Component({
  selector: 'cf-loan-list',
  imports: [CardProduct],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanList {}
