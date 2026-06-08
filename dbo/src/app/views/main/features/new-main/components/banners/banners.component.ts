import {ChangeDetectionStrategy, Component, signal, Signal} from '@angular/core';

@Component({
  selector: 'app-banners',
  imports: [],
  templateUrl: './banners.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannersComponent {
 public readonly banners:Signal<string[]> = signal(
   ['./assets/new-icons/banner/banner-3.svg','./assets/new-icons/banner/banner-2.svg','./assets/new-icons/banner/banner-1.svg'])
}
