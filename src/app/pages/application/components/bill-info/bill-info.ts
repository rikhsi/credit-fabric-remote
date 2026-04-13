import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card, SelectBill } from '@shared/components';

@Component({
  selector: 'cf-bill-info',
  imports: [Card, SelectBill],
  templateUrl: './bill-info.html',
  styleUrl: './bill-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillInfo {}
