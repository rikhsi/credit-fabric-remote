import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-applications-detail',
  templateUrl: './applications-detail.html',
  styleUrl: './applications-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsDetail {}
