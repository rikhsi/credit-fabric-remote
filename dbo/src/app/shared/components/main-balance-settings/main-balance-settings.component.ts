import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'app-main-balance-settings',
  standalone: true,
  imports: [
    MatDialogClose,
    MatIcon,
    MatRipple
  ],
  templateUrl: './main-balance-settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainBalanceSettingsComponent {

}
