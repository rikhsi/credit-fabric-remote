import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ChildrenOutletContexts, RouterOutlet} from "@angular/router";
import {routeAnimation} from "../../../../core/animations/route.animation";

@Component({
    selector: 'app-notifications',
    imports: [
        RouterOutlet
    ],
    templateUrl: './notifications.component.html',
    styles: ``,
    animations: [routeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent {
  constructor(private _contexts: ChildrenOutletContexts) {}

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }
}
