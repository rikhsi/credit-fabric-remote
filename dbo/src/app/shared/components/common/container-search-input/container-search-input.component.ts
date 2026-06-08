import { ChangeDetectionStrategy, Component } from '@angular/core';
import {UiSvgIconComponent} from "../../../../core/components/ui-svg-icon/ui-svg-icon.components";

@Component({
    selector: 'app-container-search-input',
    imports: [
        UiSvgIconComponent
    ],
    templateUrl: './container-search-input.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerSearchInputComponent {

}
