import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-filter-button',
    imports: [
        NgOptimizedImage,
        NgClass
    ],
    templateUrl: './filter-button.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterButtonComponent {
  @Input() classes = '';
  @Input() src = './assets/svg/filter-payment.svg'

}
