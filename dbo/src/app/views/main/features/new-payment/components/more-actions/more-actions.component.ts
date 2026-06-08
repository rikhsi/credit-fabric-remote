import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-more-actions',
    imports: [
        MatFormField,
        MatSelectModule,
        MatIcon,
        NgOptimizedImage,
        ReactiveFormsModule,
        NgIf,
        NgForOf,
        NgClass,
    ],
    templateUrl: './more-actions.component.html',
    styles: ``,
    styleUrls: ['./more-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoreActionsComponent {
  @Output() selected = new EventEmitter();
  dropdownOpen = false;

  @Input() actions = [
    { name: 'Запланировать', disabled: true, value: 'plan' },
    { name: 'Создать', disabled: false, value: 'create' },
    { name: 'Отправить на утверждение', disabled: true, value: 'confirm' },
    { name: 'Утверждение Директором', disabled: true, value: 'confirm' },
    { name: 'Утверждение Главным бухгалтером', disabled: true, value: 'confirm' },
    { name: 'Утверждение Долж. лицом выш. орг.', disabled: true, value: 'confirm' },
    { name: 'Вернуть на доработку', disabled: true, value: 'return' },
    { name: 'Отправить в банк', disabled: false, value: 'send' },
  ];

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onActionSelect(action: any) {
    if (!action.disabled) {
      this.dropdownOpen = false;
      this.selected.emit(action)
    }
  }

}
