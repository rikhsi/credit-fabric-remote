import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { filter, finalize, take } from 'rxjs';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { ApplicationsDetailService } from '../../../../services';
import { ModalConfirmComponent } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { EmptyListPipe } from '@shared/pipes';
import { OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { ConfirmModal } from '@app/typings/modal';

@Component({
  selector: 'cf-view-approved',
  imports: [
    TranslocoDirective,
    ApplicationConditionsCard,
    NzButtonComponent,
    NzTypographyComponent,
    NzSkeletonModule,
    EmptyListPipe,
    BounceDirective,
  ],
  templateUrl: './view-approved.html',
  styleUrl: './view-approved.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApproved implements OnInit {
  private readonly applicationsDetailService = inject(ApplicationsDetailService);
  private readonly nzModalService = inject(NzModalService);
  private readonly destroyRef = inject(DestroyRef);

  application = input.required<OnlineApplication>();
  applicationId = input.required<number>();

  readonly isClaiming = signal(false);
  readonly isOffersLoading = computed(() => this.applicationsDetailService.isOffersLoading());
  readonly offers = computed(() => this.applicationsDetailService.offers());
  readonly requestedAmount = computed(() => this.application().product.loanAmount);

  ngOnInit(): void {
    this.applicationsDetailService.getOffers$(this.applicationId()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  isHighlighted(offer: OnlineOffer): boolean {
    return offer.loanAmount > this.requestedAmount();
  }

  acceptLabelKey(offer: OnlineOffer): string {
    return this.isHighlighted(offer) ? 'application.detail.accept_more' : 'application.detail.accept_offer';
  }

  openAcceptConfirm(offer: OnlineOffer): void {
    this.openConfirmModal(
      {
        title: 'modal.application_confirm.title',
        cancel: {
          title: 'action.cancel',
          danger: false,
        },
        submit: {
          title: this.acceptLabelKey(offer),
          danger: false,
        },
      },
      offer.offerId,
      true,
    );
  }

  openRefuseConfirm(): void {
    const offerId = this.offers()[0]?.offerId;

    if (!offerId) {
      return;
    }

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
      offerId,
      false,
    );
  }

  private openConfirmModal(config: ConfirmModal, offerId: string, isAccepted: boolean): void {
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

    modalRef.afterClose
      .pipe(filter(Boolean), take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.claimLoan(offerId, isAccepted));
  }

  private claimLoan(offerId: string, isAccepted: boolean): void {
    if (this.isClaiming()) {
      return;
    }

    this.isClaiming.set(true);

    this.applicationsDetailService
      .claimLoan$(this.applicationId(), offerId, isAccepted)
      .pipe(
        finalize(() => this.isClaiming.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
