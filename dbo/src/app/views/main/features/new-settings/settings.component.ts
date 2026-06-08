import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ChildrenOutletContexts, RouterOutlet} from "@angular/router";
import {routeAnimation} from "../../../../core/animations/route.animation";

@Component({
    selector: 'app-settings',
    imports: [
        RouterOutlet
    ],
    templateUrl: './settings.component.html',
    styles: ``,
    styleUrls: ['./settings.component.scss'],
    animations: [routeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {

  constructor(private _contexts: ChildrenOutletContexts) {}

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }
  ngOnInit() {
    console.log(4323432300)
  }

}
