import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-currency-event',
  templateUrl: './currency-event.component.html',
  standalone: true,
  styleUrls: ['./currency-event.component.scss'],
  imports: [
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyEventComponent {}
