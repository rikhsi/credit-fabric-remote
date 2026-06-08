import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-my-office',
    imports: [
        RouterModule
    ],
    templateUrl: './my-office.component.html',
    styles: `
    .mdc-tab-indicator__content {
      display: none !important;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MyOfficeComponent {}
