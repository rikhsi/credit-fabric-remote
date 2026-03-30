import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'cf-logo',
  imports: [NgOptimizedImage],
  templateUrl: './logo.html',
  styleUrl: './logo.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {
  readonly isFull = input<boolean>(true);

  readonly brandLetters = ['H', 'A', 'M', 'K', 'O', 'R', 'B', 'A', 'N', 'K'] as const;

  readonly clicked = output<void>();
}
