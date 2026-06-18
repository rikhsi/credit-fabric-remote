import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-view-error',
  imports: [NzIconDirective, NzTypographyComponent],
  templateUrl: './view-error.html',
  styleUrl: './view-error.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewError {}
