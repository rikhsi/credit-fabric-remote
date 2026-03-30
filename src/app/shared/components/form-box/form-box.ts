import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { filter } from 'rxjs';
import { LOGOUT_MODAL_DATA } from '@constants';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@typings';

@Component({
  selector: 'cf-form-box',
  imports: [NzButtonComponent, NzTypographyComponent, NzIconDirective, TranslocoDirective],
  templateUrl: './form-box.html',
  styleUrl: './form-box.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.form-box--full-width]': 'fullWidth()',
  },
})
export class FormBox {
  private readonly modal = inject(NzModalService);

  public title = input<string>();

  public fullWidth = input<boolean>(false);

  /** Показать кнопку удаления; по клику открывается подтверждение. */
  public showDelete = input(false);

  /** Ключи Transloco для модалки подтверждения удаления. */
  public deleteModalTitle = input<string>('banners.delete.title');
  public deleteModalDescription = input<string>('banners.delete.description');

  public closeClick = output<void>();
  public submitClick = output<void>();
  public resetClick = output<void>();
  public deleteClick = output<void>();

  onDeleteClick(): void {
    this.modal
      .create<ModalConfirmComponent, ConfirmModal, boolean>({
        ...LOGOUT_MODAL_DATA,
        nzContent: ModalConfirmComponent,
        nzData: {
          title: this.deleteModalTitle(),
          description: this.deleteModalDescription(),
          cancel: { title: 'action.cancel', danger: false },
          submit: { title: 'action.delete', danger: true },
        },
      })
      .afterClose.pipe(filter(Boolean))
      .subscribe(() => this.deleteClick.emit());
  }
}
