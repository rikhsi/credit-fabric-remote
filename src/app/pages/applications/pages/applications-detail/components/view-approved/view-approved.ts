import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { filter, finalize, fromEvent, map, take } from 'rxjs';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { ApplicationsDetailService } from '../../../../services';
import { ModalConfirmComponent } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { ConfirmModal } from '@app/typings/modal';
import { Breakpoint } from '@app/constants/breakpoint';

@Component({
  selector: 'cf-view-approved',
  imports: [
    TranslocoDirective,
    ApplicationConditionsCard,
    NzButtonComponent,
    NzSkeletonModule,
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
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly host = inject(ElementRef<HTMLElement>);

  application = input.required<OnlineApplication>();
  applicationId = input.required<number>();

  readonly isClaiming = signal(false);
  readonly expandedOfferId = signal<string | null>(null);
  readonly isSingleFooterVisible = signal(false);
  readonly isOffersLoading = computed(() => this.applicationsDetailService.isOffersLoading());
  readonly requestedAmount = computed(() => this.application().product.loanAmount);
  readonly offers = computed(() => {
    const requested = this.requestedAmount();
    const list = [...this.applicationsDetailService.offers()];

    return list.sort((left, right) => {
      const leftMatch = left.loanAmount === requested ? 0 : 1;
      const rightMatch = right.loanAmount === requested ? 0 : 1;

      return leftMatch - rightMatch;
    });
  });
  readonly isSingle = computed(() => this.offers().length === 1);
  readonly isTriple = computed(() => this.offers().length === 3);
  readonly isPair = computed(() => {
    const count = this.offers().length;

    return count === 2 || count > 3;
  });
  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoint.MOBILE).pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  private lastScrollTop = 0;
  private singleFooterScrollBound = false;

  constructor() {
    afterNextRender(() => this.bindSingleFooterScroll());

    this.breakpointObserver
      .observe(Breakpoint.MOBILE)
      .pipe(
        filter((state) => state.matches),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => requestAnimationFrame(() => this.bindSingleFooterScroll()));
  }

  ngOnInit(): void {
    this.applicationsDetailService
      .getOffers$(this.applicationId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((offers) => {
        const requested = this.requestedAmount();
        const matched = offers.find((offer) => offer.loanAmount === requested);

        this.expandedOfferId.set(matched?.offerId ?? offers[0]?.offerId ?? null);
        requestAnimationFrame(() => this.bindSingleFooterScroll());
      });
  }

  isCollapsible(): boolean {
    return !this.isSingle() && !!this.isMobile();
  }

  isExpanded(offer: OnlineOffer): boolean {
    if (!this.isCollapsible()) {
      return true;
    }

    return this.expandedOfferId() === offer.offerId;
  }

  onExpandedChange(offerId: string, expanded: boolean): void {
    this.expandedOfferId.set(expanded ? offerId : null);
  }

  isHighlighted(offer: OnlineOffer): boolean {
    return offer.loanAmount === this.requestedAmount();
  }

  openAcceptConfirm(offer: OnlineOffer): void {
    this.openConfirmModal(
      {
        title: 'modal.application_confirm.title',
        description: 'modal.application_confirm.description',
        cancel: {
          title: 'action.cancel',
          danger: false,
        },
        submit: {
          title: 'application.detail.accept',
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

  private bindSingleFooterScroll(): void {
    if (this.singleFooterScrollBound || !this.isSingle() || !this.isMobile()) {
      return;
    }

    const scrollRoot = this.host.nativeElement.querySelector('.conditions') as HTMLElement | null;

    if (!scrollRoot) {
      return;
    }

    this.singleFooterScrollBound = true;
    this.lastScrollTop = scrollRoot.scrollTop;
    this.isSingleFooterVisible.set(false);

    // No overflow — otherwise CTA would be unreachable.
    if (scrollRoot.scrollHeight <= scrollRoot.clientHeight + 1) {
      this.isSingleFooterVisible.set(true);
      return;
    }

    fromEvent(scrollRoot, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const top = scrollRoot.scrollTop;
        const delta = top - this.lastScrollTop;

        if (top <= 8) {
          this.isSingleFooterVisible.set(false);
        } else if (delta > 4) {
          this.isSingleFooterVisible.set(true);
        } else if (delta < -4) {
          this.isSingleFooterVisible.set(false);
        }

        this.lastScrollTop = top;
      });
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
