import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { routeAnimation } from 'src/app/core/animations/route.animation';

@Component({
    selector: 'app-chat',
    imports: [RouterModule],
    templateUrl: './chat.component.html',
    styles: ``,
    animations: [routeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  constructor(private _contexts: ChildrenOutletContexts) {}

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }
}
