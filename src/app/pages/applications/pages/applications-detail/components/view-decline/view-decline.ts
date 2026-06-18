import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-view-decline',
  imports: [NzIconDirective, NzTypographyComponent],
  templateUrl: './view-decline.html',
  styleUrl: './view-decline.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDecline {}
