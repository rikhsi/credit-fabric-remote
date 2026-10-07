import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Card } from '@shared/components';
import { BounceDirective, HandbookDirective } from '@shared/directives';
import { HandbookPipe, PhoneNumberPipe } from '@shared/pipes';
import { contactFullName, isContactsFilled } from '@pages/loan/utils/contacts';
import { StartProcessingContact } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-contact-info',
  imports: [
    Card,
    NzButtonComponent,
    NzIconDirective,
    NzSpinComponent,
    NzTypographyComponent,
    NzTagComponent,
    TranslocoDirective,
    BounceDirective,
    HandbookDirective,
    HandbookPipe,
    PhoneNumberPipe,
  ],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {
  readonly items = input<StartProcessingContact[]>([]);
  readonly isLoading = input(false);

  readonly isFilled = computed(() => isContactsFilled(this.items()));

  readonly add = output<void>();
  readonly edit = output<number>();
  readonly remove = output<number>();

  fullName(contact: StartProcessingContact): string {
    return contactFullName(contact);
  }

  onAdd(): void {
    if (this.isLoading()) {
      return;
    }

    this.add.emit();
  }

  onEdit(index: number): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit(index);
  }

  onRemove(index: number): void {
    if (this.isLoading()) {
      return;
    }

    this.remove.emit(index);
  }
}
