import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AddressForm, AddressInfo, CalculatorForm, CalculatorResult, ProductAcception } from '@pages/loan/components';
import { Card } from '@shared/components';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services/auth.service';
import { LoanProductsService } from '@core/services/loan-products.service';
import { RouteParam } from '@app/constants/route-param';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-loan-detail',
  imports: [AddressInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanDetailService],
})
export class LoanDetail implements OnInit {
  private readonly nmService = inject(NzModalService);
  private readonly ldService = inject(LoanDetailService);
  private readonly productsService = inject(LoanProductsService);
  private readonly vcRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly form = linkedSignal(() => this.ldService.form);
  public readonly calculationResult = computed(() => this.ldService.calculationResult());
  public readonly user = computed(() => this.authService.user());
  public readonly isLoading = computed(() => this.ldService.isLoading());

  get docs(): string[] {
    return this.route.snapshot.data['docs'] || [];
  }

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  ngOnInit(): void {
    const product = this.productsService.getById(this.loanId);

    if (product) {
      this.ldService.applyProduct(product);
    }

    this.ldService
      .checkValidate$(this.user()?.pinfl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ldService.isLoading.set(false);
          this.ldService.isDisabled.set(false);
        },
        error: () => {
          this.ldService.isLoading.set(false);
          this.ldService.isDisabled.set(false);
        },
      });
  }

  openAddressForm(editIndex: number): void {
    const items = this.ldService.form().value().addresses;
    const nzData = items[editIndex];

    const modalRef = this.nmService.create<AddressForm, OnlineStartProcessingAddress, OnlineStartProcessingAddress>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: AddressForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.ldService.form().value.update((cur) => {
        const addresses = cur.addresses.map((item, index) =>
          index === editIndex ? { ...value, sysAddressTypeId: item.sysAddressTypeId } : item,
        );

        return {
          ...cur,
          addresses,
        };
      });
    });
  }

  submit(): void {}
}
