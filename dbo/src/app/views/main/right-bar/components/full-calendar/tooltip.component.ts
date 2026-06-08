import { AfterViewInit, Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

type TooltipPos = 'above' | 'below' | 'right' | 'before' | 'after' | 'left';

@Component({
    selector: 'app-tooltip',
    imports: [MatTooltipModule],
    template: `
    <div class="tooltip" [matTooltip]="tooltipText" [matTooltipPosition]="tooltipPosition">
      <ng-content></ng-content>
    </div>
  `,
    styles: [`
    .tooltip {
      display: inline-block;
      position: relative;
    }
  `]
})
export class TooltipComponent implements AfterViewInit {
  @Input() tooltipText: string = '';
  @Input() tooltipPosition: TooltipPos = 'above';
  ngAfterViewInit() {
    // Your logic to attach the tooltip to the event element goes here
  }
}
