import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { routeAnimation } from 'src/app/core/animations/route.animation';

@Component({
  selector: 'app-salary-project',
  standalone: true,
  animations: [routeAnimation],
  imports: [RouterModule],
  templateUrl: './salary-project.component.html',
  styles: `
      .salary-table {
        tr { height: 64px }
        th:not(:first-child), td:not(:first-child) { padding-right: 15px; }
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SalaryProjectComponent {
  constructor(
    private _contexts: ChildrenOutletContexts,
  ) {}
  
  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }
}
