import { ChangeDetectionStrategy, Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-loan',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './loan.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanComponent {

}
