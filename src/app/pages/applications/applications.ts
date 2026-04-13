import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardApplication } from './components';

@Component({
  selector: 'cf-applications',
  imports: [CardApplication],
  templateUrl: './applications.html',
  styleUrl: './applications.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Applications {}
