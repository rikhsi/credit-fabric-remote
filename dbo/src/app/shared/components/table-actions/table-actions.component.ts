import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableButton } from '../../interfaces/table-button.interface';
import { TableActionButtonComponent } from './components/table-action-button/table-action-button.component';

@Component({
    selector: 'app-table-actions',
    imports: [
        TableActionButtonComponent
    ],
    templateUrl: './table-actions.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionsComponent {
  @Input() tableActionBtns: TableButton[] = [];
  @Output() onClick = new EventEmitter();

  clicked(value: string) {
    this.onClick.emit(value);
  }
}
