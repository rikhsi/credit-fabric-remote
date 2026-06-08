import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { ActionComponent } from '../../../../../../shared/components/action/action.component';
import { QuickAction } from '../../../../../../shared/interfaces/quick-action.interface';
import { AdditionalInfoComponent } from '../../../../../../shared/components/additional-info/additional-info.component';

@Component({
    selector: 'app-quick-actions',
    imports: [
        NgOptimizedImage,
        ActionComponent,
        AdditionalInfoComponent,
        NgClass
    ],
    templateUrl: './quick-actions.component.html',
    styles: ``,
    styleUrls: ['./quick-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickActionsComponent {
  @Input() title = 'Быстрые действия';
  @Input() gridCols = '3';
  @Input() class = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 4xl:grid-cols-6';
  @Input() showHeader = true;
  @Input() actionClass = '';
  @Input() actions: QuickAction[] = [];

  @Output() onSettings = new EventEmitter();
}
