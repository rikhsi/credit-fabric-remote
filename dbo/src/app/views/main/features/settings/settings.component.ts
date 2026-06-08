import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ChildrenOutletContexts, RouterOutlet} from "@angular/router";
import {routeAnimation} from "../../../../core/animations/route.animation";

@Component({
    selector: 'app-settings',
    imports: [
        RouterOutlet
    ],
    templateUrl: './settings.component.html',
    styles: ``,
    animations: [routeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {

  constructor(private _contexts: ChildrenOutletContexts) {}

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }

}
