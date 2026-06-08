import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectComponent } from '../../../../../../shared/components/select/select.component';
import { SearchableComponent } from '../../../../../../core/components/searchable/searchable.component';
import { NgOptimizedImage } from '@angular/common';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import {
  CreateButtonComponent
} from '../../../../../../shared/components/common/create-button/create-button.component';
import {
  ContainerSelectComponent
} from '../../../../../../shared/components/common/container-select/container-select.component';
import {
  ContainerSearchInputComponent
} from '../../../../../../shared/components/common/container-search-input/container-search-input.component';
import { ICreateButton } from '../../../../../../shared/interfaces/create-button.interface';

@Component({
    selector: 'app-operations-filter',
    imports: [
        SelectComponent,
        SearchableComponent,
        NgOptimizedImage,
        FilterButtonComponent,
        CreateButtonComponent,
        ContainerSelectComponent,
        ContainerSearchInputComponent
    ],
    templateUrl: './operations-filter.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsFilterComponent {
  @Input() create!: ICreateButton;
}
