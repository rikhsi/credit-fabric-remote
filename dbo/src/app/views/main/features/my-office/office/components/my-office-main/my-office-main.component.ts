import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

import { TransportComponent } from '../../../transport/components/transport/transport.component';
import { MyOfficeListComponent } from '../my-office-list/my-office-list.component';
import { MyOfficeServicesComponent } from '../my-office-services/my-office-services.component';

@Component({
    selector: 'app-my-office-main',
    imports: [
        TransportComponent,
        MatTab,
        MatTabGroup,
        MyOfficeListComponent,
        MyOfficeServicesComponent,
    ],
    templateUrl: './my-office-main.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOfficeMainComponent {}
