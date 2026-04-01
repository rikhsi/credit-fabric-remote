import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-card-advantage',
  imports: [Card, NgOptimizedImage],
  templateUrl: './card-advantage.html',
  styleUrl: './card-advantage.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAdvantage {
  title = input.required<string>();
  description = input.required<string>();
  photo = input<string>('images/advantage.png');
}
