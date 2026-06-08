import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-deposit-applications',
    imports: [CommonModule],
    templateUrl: './deposit-applications.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositApplicationsComponent {

}
