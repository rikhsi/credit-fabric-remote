import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {CorpCard} from "../../../accounts-and-payments/constants/table-columns";
import {MatIcon} from "@angular/material/icon";
import {PayrollProjectResponseContent} from "../../../payroll-project/models/payroll-project.type";
import {MatDivider} from "@angular/material/divider";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-corp-card-info',
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider
  ],
  templateUrl: './corp-card-info.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardInfoComponent {
  public data: PayrollProjectResponseContent = inject(MAT_DIALOG_DATA)
  private readonly snackBar = inject(MatSnackBar)

  get expiry (){
    const expiry =this.data.expiryDate
    const first = expiry.slice(0,2)
    const last = expiry.slice(2)
    return first + '/' + last
  }

  copyAll() {
    const textToCopy = `
Номер карты: ${this.data.pan ?? ''}
Срок действия: ${this.data.expiryDate ?? ''}
Тип карты: ${this.data.type ?? ''}
Держатель карты: ${this.data.ownerName ?? ''}
Название карты: ${this.data.title ?? ''}
Транзитный счёт: ${this.data.transitAccount ?? ''}
Статус: ${this.data.status === 'ACTIVE' ? 'Активный' : 'Не активный'}
  `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      this.snackBar.open('Реквизиты карты скопированы ✅', 'Закрыть', { duration: 3000 });
    }).catch(() => {
      this.snackBar.open('Ошибка копирования', 'Закрыть', { duration: 3000 });
    });
  }

  share() {
    const textToShare = `
Номер карты: ${this.data.pan ?? ''}
Срок действия: ${this.data.expiryDate ?? ''}
Тип карты: ${this.data.type ?? ''}
Держатель карты: ${this.data.ownerName ?? ''}
Название карты: ${this.data.title ?? ''}
Транзитный счёт: ${this.data.transitAccount ?? ''}
Статус: ${this.data.status === 'ACTIVE' ? 'Активный' : 'Не активный'}
  `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'Реквизиты карты',
        text: textToShare
      }).then(() => {
        this.snackBar.open('Поделились ✅', 'Закрыть', { duration: 2000 });
      }).catch((err) => {
        console.error('Share error:', err);
        this.snackBar.open('Не удалось поделиться', 'Закрыть', { duration: 3000 });
      });
    } else {
      navigator.clipboard.writeText(textToShare).then(() => {
        this.snackBar.open('Web Share не поддерживается — данные скопированы ✅', 'Закрыть', { duration: 3000 });
      }).catch(() => {
        this.snackBar.open('Web Share не поддерживается и копирование не удалось', 'Закрыть', { duration: 3000 });
      });
    }
  }

  protected readonly navigator = navigator;

}
