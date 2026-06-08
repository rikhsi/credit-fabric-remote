import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AdditionalInfoDetails } from '../../interfaces/additional-info.interface';

@Component({
    selector: 'app-additional-info-card',
    imports: [
        NgOptimizedImage
    ],
    templateUrl: './additional-info-card.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalInfoCardComponent {
  @Input() info!: AdditionalInfoDetails;
}
