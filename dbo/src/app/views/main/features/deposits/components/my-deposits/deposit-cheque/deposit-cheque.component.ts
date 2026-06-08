import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
  selector: 'app-deposit-cheque',
  standalone: true,
  imports: [UiSvgIconComponent, MatRipple],
  templateUrl: './deposit-cheque.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositChequeComponent {
  constructor(public dialogRef: DialogRef) {};
}
