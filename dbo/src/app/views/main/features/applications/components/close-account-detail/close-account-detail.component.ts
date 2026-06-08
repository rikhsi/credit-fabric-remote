import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-close-account-detail',
    imports: [
        DatePipe,
        NgForOf,
        NgClass,
        NgTemplateOutlet,
        NgIf,
    ],
    templateUrl: './close-account-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloseAccountDetailComponent {
  @Input() detail!: any;
}
