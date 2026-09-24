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
import { ApplicationSentModal, ModalConfirmComponent } from '@shared/components';
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
  /** Mobile fixed footer (single accept/refuse or multi refuse). */
  readonly isFixedFooterVisible = signal(false);
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
  private fixedFooterScrollBound = false;

  constructor() {
    afterNextRender(() => this.bindFixedFooterScroll());

    this.breakpointObserver
      .observe(Breakpoint.MOBILE)
      .pipe(
        filter((state) => state.matches),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => requestAnimationFrame(() => this.bindFixedFooterScroll()));
  }

  ngOnInit(): void {
    this.applicationsDetailService
      .getOffers$(this.applicationId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((offers) => {
        const requested = this.requestedAmount();
        const matched = offers.find((offer) => offer.loanAmount === requested);

        this.expandedOfferId.set(matched?.offerId ?? offers[0]?.offerId ?? null);
        requestAnimationFrame(() => this.bindFixedFooterScroll());
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
    this.queueFixedFooterSync();
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

  private bindFixedFooterScroll(): void {
    if (this.fixedFooterScrollBound || !this.isMobile() || !this.offers().length) {
      return;
    }

    const scrollTarget = this.resolveScrollTarget();

    if (!scrollTarget) {
      return;
    }

    this.fixedFooterScrollBound = true;
    this.lastScrollTop = this.readScrollTop(scrollTarget);
    this.queueFixedFooterSync();

    fromEvent(scrollTarget, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFixedFooterScroll(scrollTarget));

    fromEvent(window, 'resize', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.queueFixedFooterSync());

    const offers = this.host.nativeElement.querySelector('.offers');

    if (offers && typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => this.queueFixedFooterSync());

      resizeObserver.observe(offers);
      this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    }
  }

  /** Collapse/expand animates ~350ms — re-check after layout settles. */
  private queueFixedFooterSync(): void {
    requestAnimationFrame(() => this.syncFixedFooterForOverflow());
    setTimeout(() => this.syncFixedFooterForOverflow(), 400);
  }

  private onFixedFooterScroll(scrollTarget: HTMLElement | Window): void {
    if (this.isContentFitting(scrollTarget)) {
      this.isFixedFooterVisible.set(true);
      this.lastScrollTop = this.readScrollTop(scrollTarget);
      return;
    }

    const top = this.readScrollTop(scrollTarget);
    const delta = top - this.lastScrollTop;

    if (top <= 8) {
      this.isFixedFooterVisible.set(false);
    } else if (delta > 4) {
      this.isFixedFooterVisible.set(true);
    } else if (delta < -4) {
      this.isFixedFooterVisible.set(false);
    }

    this.lastScrollTop = top;
  }

  private syncFixedFooterForOverflow(): void {
    if (!this.isMobile() || !this.offers().length) {
      this.isFixedFooterVisible.set(false);
      return;
    }

    const scrollTarget = this.resolveScrollTarget();

    if (!scrollTarget) {
      this.isFixedFooterVisible.set(true);
      return;
    }

    // Cards fit the screen — refuse/accept must stay reachable without scrolling.
    if (this.isContentFitting(scrollTarget)) {
      this.isFixedFooterVisible.set(true);
      return;
    }

    const top = this.readScrollTop(scrollTarget);

    this.lastScrollTop = top;
    this.isFixedFooterVisible.set(top > 8);
  }

  private resolveScrollTarget(): HTMLElement | Window | null {
    if (this.isSingle()) {
      return this.host.nativeElement.querySelector('.conditions');
    }

    // Multi offers: page/window scroll (cards are in normal document flow).
    return window;
  }

  private readScrollTop(target: HTMLElement | Window): number {
    if (target === window) {
      return window.scrollY || document.documentElement.scrollTop || 0;
    }

    return (target as HTMLElement).scrollTop;
  }

  /**
   * True when real content fits the viewport.
   * Footer clearance padding alone must not count as "needs scroll".
   */
  private isContentFitting(target: HTMLElement | Window): boolean {
    if (target === window) {
      const offers = this.host.nativeElement.querySelector('.offers') as HTMLElement | null;

      if (!offers) {
        return true;
      }

      const padBottom = Number.parseFloat(getComputedStyle(offers).paddingBottom) || 0;
      const contentBottom = offers.getBoundingClientRect().bottom - padBottom;

      return contentBottom <= window.innerHeight + 8;
    }

    const el = target as HTMLElement;
    const padBottom = Number.parseFloat(getComputedStyle(el).paddingBottom) || 0;
    const contentHeight = el.scrollHeight - padBottom;

    return contentHeight <= el.clientHeight + 8;
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
      .subscribe({
        next: () => {
          if (!isAccepted) {
            return;
          }

          // Defer so the modal survives the OnDecision → OnDesign view switch.
          setTimeout(() => this.openApplicationSentModal());
        },
      });
  }

  private openApplicationSentModal(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ApplicationSentModal,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzClassName: 'cf-application-sent-modal',
    });
  }
}
