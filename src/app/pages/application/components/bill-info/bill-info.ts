import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { OnlineAccount } from '@api/models/los/account';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';
import { Card, SelectBill } from '@shared/components';

@Component({
  selector: 'cf-bill-info',
  imports: [Card, SelectBill, TranslocoDirective, FormField],
  templateUrl: './bill-info.html',
  styleUrl: './bill-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillInfo {
  readonly accounts = input<OnlineAccount[]>([]);
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();
}
