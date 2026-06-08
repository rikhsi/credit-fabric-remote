import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ICreateButton } from '../../../interfaces/create-button.interface';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-create-button',
    imports: [
        NgOptimizedImage,
        RouterLink
    ],
    templateUrl: './create-button.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateButtonComponent {
  @Input() create!: ICreateButton;
}
