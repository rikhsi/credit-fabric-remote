import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { ISelectAction } from '../../interfaces/select-actions.interface';
import { MatOption } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatLabel, MatSelect } from '@angular/material/select';

@Component({
    selector: 'app-select-action',
    imports: [
        MatFormField,
        MatOption,
        MatIcon,
        MatLabel,
        NgOptimizedImage,
        MatSelect,
        MatSuffix,
        NgClass,
    ],
    templateUrl: './select-action.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectActionComponent {
  @Input() label = 'Еще действия';
  @Input() actions: ISelectAction[] = [];
  @Output() onAction = new EventEmitter();
  selectedAction!: ISelectAction;

  selectAction(action: ISelectAction) {
    this.selectedAction = action;
  }

  send() {
    this.onAction.emit(this.selectedAction);
  }
}
