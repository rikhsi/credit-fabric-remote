import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-create-account-detail',
    imports: [
        NgTemplateOutlet,
        DatePipe,
    ],
    templateUrl: './create-account-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAccountDetailComponent {
  @Input() detail!: any;
}
