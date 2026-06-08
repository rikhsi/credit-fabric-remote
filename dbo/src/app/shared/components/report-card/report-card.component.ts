import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { getStatusApplication } from '../../../core/utils/mixin.utils';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-report-card',
    imports: [
        NgClass,
        DatePipe,
        MatProgressBarModule
    ],
    templateUrl: './report-card.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportCardComponent {
  @Input() application!: any;

  protected readonly getStatusApplication = getStatusApplication;
}
