import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { filter, finalize, take } from 'rxjs';
import { ApplicationProductInfo } from '../application-product-info/application-product-info';
import { CommentApplication, StatusApplication } from '../../../../components';
import { ApplicationsDetailService } from '../../../../services';
import { Card, ModalConfirmComponent, SelectBill } from '@shared/components';
import { OnlineAccount } from '@api/models/los/account';
import { OnlineApplication } from '@api/models/los/application';
import { BounceDirective } from '@shared/directives';
import { matchSelectedAccount } from '@shared/utils/account';
import { ConfirmModal } from '@app/typings/modal';

@Component({
  selector: 'cf-view-approved',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    CommentApplication,
    ApplicationProductInfo,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
    NzButtonComponent,
    BounceDirective,
  ],
  templateUrl: './view-approved.html',
  styleUrl: './view-approved.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApproved {
  private readonly applicationsDetailService = inject(ApplicationsDetailService);
  private readonly nzModalService = inject(NzModalService);
  private readonly destroyRef = inject(DestroyRef);

  application = input.required<OnlineApplication>();
  applicationId = input.required<number>();
  accounts = input<OnlineAccount[]>([]);

  readonly isClaiming = signal(false);
  readonly accountItems = computed(() => matchSelectedAccount(this.accounts(), this.application().accountNo));

  openApproveConfirm(): void {
    this.openConfirmModal(
      {
        title: 'modal.application_confirm.title',
        cancel: {
          title: 'action.cancel',
          danger: false,
        },
        submit: {
          title: 'action.approve',
          danger: false,
        },
      },
      true,
    );
  }

  openRefuseConfirm(): void {
    this.openConfirmModal(
      {
        title: 'modal.application_decline.title',
        description: 'modal.application_decline.description',
        cancel: {
          title: 'action.cancel',
          danger: false,
        },
        submit: {
          title: 'application.detail.refuse',
          danger: true,
        },
      },
      false,
    );
  }

  private openConfirmModal(config: ConfirmModal, isAccepted: boolean): void {
    if (this.isClaiming()) {
      return;
    }

    const modalRef = this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: config,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.claimLoan(isAccepted));
  }

  private claimLoan(isAccepted: boolean): void {
    if (this.isClaiming()) {
      return;
    }

    this.isClaiming.set(true);

    this.applicationsDetailService
      .claimLoan$(this.applicationId(), this.application().accountNo, isAccepted)
      .pipe(
        finalize(() => this.isClaiming.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
