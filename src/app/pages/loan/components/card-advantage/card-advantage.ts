import { NgOptimizedImage, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { TranslocoDirective } from '@jsverse/transloco';
import { Card } from '@shared/components';
import { ImagePipe } from '@shared/pipes';

@Component({
  selector: 'cf-card-advantage',
  imports: [Card, NgOptimizedImage, TranslocoDirective, NzTypographyComponent, NzSkeletonModule, NgClass, ImagePipe],
  templateUrl: './card-advantage.html',
  styleUrl: './card-advantage.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAdvantage {
  title = input.required<string>();
  description = input.required<string>();
  isLoading = input<boolean>();
  photo = input<string>('advantage.png');
}
