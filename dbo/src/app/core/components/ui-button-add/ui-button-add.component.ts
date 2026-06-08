import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {UiSvgIconComponent} from "../ui-svg-icon/ui-svg-icon.components";

@Component({
    selector: 'app-ui-button-add',
    template: `
    <div
      class="rounded-lg w-16 bg-transparent border border-solid border-[rgba(114,121,112,0.16)] p-2 flex items-center justify-center  cursor-pointer"
      [ngClass]="class">
      <div class="rounded-lg p-2 bg-gray-200">
        <app-ui-svg-icon
          path="./assets/icons/btn-icons.svg#add"
          svgClass="h-6 w-6"></app-ui-svg-icon>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, UiSvgIconComponent, UiSvgIconComponent]
})
export class UiButtonAddComponent {
  @Input() public class = 'w-11 h-[83px]';
}
