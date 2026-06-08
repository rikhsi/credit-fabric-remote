import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalaryCardRes } from '../../../entities/salary/salary.model';
import { cardStatusIcons } from '../../../shared/models/card-status';
import { ShortCardNumberPipe } from '../../../shared/pipes/short-card-number.pipe';
import { ExpiryDatePipe } from '../../../shared/pipes/expiry-date.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-expired-employees-dialog',
  imports: [
    IconComponent,
    MatDialogClose,
    TranslateModule,
    ShortCardNumberPipe,
    ExpiryDatePipe,
  ],
  providers: [ExpiryDatePipe],
  templateUrl: './expired-employees-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiredEmployeesDialogComponent {
  public readonly data = inject<{ employees: SalaryCardRes[] }>(MAT_DIALOG_DATA);
  protected readonly cardStatusIcons = cardStatusIcons;

  private readonly translate = inject(TranslateService);
  private readonly expiryDate = inject(ExpiryDatePipe);
  private readonly snackBar = inject(MatSnackBar);

  copyCardsToClipboard(): void {
    const text = this.data.employees.map(card => {

      return [
        `Система: ${card.type}`,
        `Держатель карты: ${card.ownerName}`,
        `Номер карты: ${card.pan}`,
        `Срок действия: ${this.expiryDate.transform(card.expiryDate)}`,
        `Статус: ${this.translate.instant(cardStatusIcons[card.status].label)}`,
      ].join('\n');
    }).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(`${this.translate.instant('new.copied')} ✅`, 'Закрыть', {duration: 3000});
    });
  }
}
