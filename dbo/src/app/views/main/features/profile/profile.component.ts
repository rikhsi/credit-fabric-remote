import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ChildrenOutletContexts, RouterOutlet} from "@angular/router";
import {routeAnimation} from "../../../../core/animations/route.animation";
import {take} from "rxjs";

@Component({
    selector: 'app-profile',
    imports: [
        RouterOutlet
    ],
    templateUrl: './profile.component.html',
    styles: ``,
    animations: [routeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

  constructor(private _contexts: ChildrenOutletContexts) {}

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }

}
