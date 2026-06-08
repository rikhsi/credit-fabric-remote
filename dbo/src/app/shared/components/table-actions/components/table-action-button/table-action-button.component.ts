import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import { TableButton } from '../../../../interfaces/table-button.interface';

@Component({
    selector: 'app-table-action-button',
    imports: [
        NgOptimizedImage,
        NgClass,
        NgIf
    ],
    templateUrl: './table-action-button.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.Default
})
export class TableActionButtonComponent {
  @Input() data!: TableButton;
  @Input() selectedRows!: number;
  @Output() onClick = new EventEmitter<string>();

  clicked(id: string) {
    if(this.data.active) {
      this.onClick.emit(id);
    }
  }
}
