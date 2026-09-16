import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, forkJoin, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AddressForm, AddressInfo, CalculatorForm, CalculatorResult, ProductAcception } from '@pages/loan/components';
import { Card } from '@shared/components';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services/auth.service';
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
  private readonly vcRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  public readonly form = linkedSignal(() => this.ldService.form);
  public readonly calculationResult = computed(() => this.ldService.calculationResult());
  public readonly user = computed(() => this.authService.user());
  public readonly isLoading = computed(() => this.ldService.isLoading());

  get docs(): string[] {
    return this.route.snapshot.data['docs'] || [];
  }

  ngOnInit(): void {
    forkJoin([this.ldService.checkValidate$(this.user()?.pinfl)]).subscribe({
      next: () => {
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
