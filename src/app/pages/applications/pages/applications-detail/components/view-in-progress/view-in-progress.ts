import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-view-in-progress',
  imports: [NzSpinComponent, NzTypographyComponent],
  templateUrl: './view-in-progress.html',
  styleUrl: './view-in-progress.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInProgress {}
