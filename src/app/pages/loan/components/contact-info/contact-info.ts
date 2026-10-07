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
import { isContactFilled } from '@pages/loan/utils/contacts';
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
  readonly item = input<StartProcessingContact | null>(null);
  readonly isLoading = input(false);

  readonly isFilled = computed(() => {
    const item = this.item();

    return item != null && isContactFilled(item);
  });

  readonly fullName = computed(() => {
    const item = this.item();

    if (!item) {
      return '';
    }

    return [item.firstName, item.lastName].map((part) => part.trim()).filter(Boolean).join(' ');
  });

  readonly edit = output<void>();

  onFill(): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit();
  }
}
