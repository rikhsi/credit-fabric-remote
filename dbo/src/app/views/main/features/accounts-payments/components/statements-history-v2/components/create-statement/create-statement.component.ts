import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-create-statement',
  imports: [
    RouterOutlet
  ],
  templateUrl: './create-statement.component.html',
  styleUrls: ['./create-statement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,

})
export default class CreateStatementComponent {
}
