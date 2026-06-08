import {ChangeDetectionStrategy, Component,} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule, RouterOutlet } from '@angular/router';
import { routeAnimation } from 'src/app/core/animations/route.animation';

@Component({
    selector: 'app-deposits',
    animations: [routeAnimation],
    imports: [CommonModule, RouterModule,RouterOutlet],
    templateUrl: './deposits.component.html',
    styles: [
        `
      .active {
        color: white;
        background-color: #264796;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent  {

}
