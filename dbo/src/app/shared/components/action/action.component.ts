import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-action',
    imports: [
        NgOptimizedImage,
        RouterLink,
        NgClass
    ],
    templateUrl: './action.component.html',
    styles: ``,
    styleUrls: ['./action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {
  @Input() svg = '';
  @Input() title = '';
  @Input() link = '';
  @Input() class = '';
}
