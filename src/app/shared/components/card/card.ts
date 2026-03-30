import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-card',
  imports: [TranslocoDirective, NzTypographyComponent, NgClass],
  templateUrl: './card.html',
  styleUrl: './card.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  title = input<string>();
  showSpace = input<boolean>(false);
}
