import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-applications',
  imports: [],
  templateUrl: './applications.html',
  styleUrl: './applications.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Applications {}
