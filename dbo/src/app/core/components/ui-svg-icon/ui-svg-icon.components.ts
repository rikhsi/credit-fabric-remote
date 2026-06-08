import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-ui-svg-icon',
    template: `
    <div [ngClass]="svgClass">
      <svg class="w-full h-full" [attr.viewBox]="viewBox">
        <use [attr.href]="path"></use>
      </svg>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass]
})
export class UiSvgIconComponent {
  @Input({ required: true }) public path!: string;
  @Input() public svgClass!: string;
  @Input() public viewBox!: string;
}
