import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { DepositFilterComponent } from "../deposit-filter/deposit-filter.component";
import { FirebaseAnalyticsService } from 'firebase-analytics.service';
import { DepositService } from '../../services/deposit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DepositTableComponent } from '../deposit-table/deposit-table.component';
import { DataStateWrapperComponent } from '../../../../../../shared/ui/data-state-wrapper/data-state-wrapper.component';
import { TranslateModule } from '@ngx-translate/core';
import { DepositItemDTO } from '../../models/deposits.model';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-deposit-main',
  imports: [NgClass, DepositFilterComponent, DepositTableComponent, DataStateWrapperComponent, TranslateModule],
  template: `
   <div class="mr-[70px]">
    <h1 class="text-custom-primary text-[28px] font-bold">{{ 'deposits.deposits' | translate }}</h1>
    <div class="flex mt-5 gap-2">
      @for (tab of tabs; track tab.value) {
        <button
          type="button"
          [ngClass]="activeTab() === tab.value
            ? 'flex justify-center items-center px-[15px] py-[9px] border border-[#EBEBEB] bg-white text-[#171717] text-lg font-semibold leading-5 rounded-xl'
            : 'flex justify-center items-center px-[15px] py-[9px] border border-transparent text-[#5C5C5C] text-lg font-semibold leading-5 rounded-xl'"
          (click)="setActiveTab(tab.value)"
        >
          {{ tab.title | translate }}
        </button>
      }
    </div>
    <div class="py-5 px-6 bg-surface-2 rounded-[22px] mt-5">
      <div>
        <app-deposit-filter (filterChange)="onFilterChange($event)"></app-deposit-filter>
      </div>
      <div class="mt-5">
        @if (!isFetching() && contractList().length === 0) {
          <div class="flex flex-col items-center justify-center gap-4 min-h-[420px] text-center">
            <svg class="[&_rect]:fill-[#F7F7F7] dark:[&_rect]:fill-[#2A2A2A]" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="68" height="68" rx="34" fill="#F7F7F7"/>
              <path d="M30 44.6668C30.7363 44.6668 31.3333 45.2637 31.3333 46.0001C31.3333 46.7365 30.7363 47.3334 30 47.3334H26C25.2636 47.3334 24.6666 46.7365 24.6666 46.0001C24.6666 45.2637 25.2636 44.6668 26 44.6668H30ZM42 44.6668C42.7363 44.6668 43.3333 45.2637 43.3333 46.0001C43.3333 46.7365 42.7363 47.3334 42 47.3334H38C37.2636 47.3334 36.6666 46.7365 36.6666 46.0001C36.6666 45.2637 37.2636 44.6668 38 44.6668H42ZM44.6666 26.267C44.6666 25.4983 44.6649 25.0016 44.6341 24.6238C44.6045 24.2617 44.5544 24.1272 44.5208 24.0613C44.393 23.8107 44.1894 23.607 43.9388 23.4793C43.8729 23.4457 43.7384 23.3956 43.3763 23.366C42.9985 23.3351 42.5018 23.3334 41.733 23.3334H26.2669C25.4982 23.3334 25.0014 23.3351 24.6237 23.366C24.2615 23.3956 24.1271 23.4457 24.0612 23.4793C23.8105 23.607 23.6069 23.8107 23.4791 24.0613C23.4455 24.1272 23.3954 24.2617 23.3659 24.6238C23.335 25.0016 23.3333 25.4983 23.3333 26.267V37.7332C23.3333 38.5019 23.335 38.9986 23.3659 39.3764C23.3954 39.7385 23.4455 39.873 23.4791 39.9389C23.6069 40.1895 23.8105 40.3931 24.0612 40.5209C24.1271 40.5545 24.2615 40.6046 24.6237 40.6342C25.0014 40.6651 25.4982 40.6668 26.2669 40.6668H41.733C42.5018 40.6668 42.9985 40.6651 43.3763 40.6342C43.7384 40.6046 43.8728 40.5545 43.9388 40.5209C44.1894 40.3931 44.393 40.1895 44.5208 39.9389C44.5544 39.873 44.6045 39.7385 44.6341 39.3764C44.6649 38.9986 44.6666 38.5019 44.6666 37.7332V26.267ZM40 37.3334V26.6668C40 25.9304 40.5969 25.3334 41.3333 25.3334C42.0697 25.3334 42.6666 25.9304 42.6666 26.6668V37.3334C42.6666 38.0698 42.0697 38.6668 41.3333 38.6668C40.5969 38.6668 40 38.0698 40 37.3334ZM32 32.0001C32 30.8955 31.1045 30.0001 30 30.0001C28.8954 30.0001 28 30.8955 28 32.0001C28 33.1047 28.8954 34.0001 30 34.0001C31.1045 34.0001 32 33.1047 32 32.0001ZM34.6666 32.0001C34.6666 34.5774 32.5773 36.6668 30 36.6668C27.4226 36.6668 25.3333 34.5774 25.3333 32.0001C25.3333 29.4228 27.4226 27.3334 30 27.3334C32.5773 27.3334 34.6666 29.4228 34.6666 32.0001ZM47.3333 37.7332C47.3333 38.4579 47.3347 39.0823 47.2929 39.5938C47.2499 40.1208 47.1541 40.6454 46.8971 41.1498C46.5137 41.9021 45.902 42.5138 45.1497 42.8972C44.6453 43.1542 44.1207 43.25 43.5937 43.2931C43.0822 43.3349 42.4578 43.3334 41.733 43.3334H26.2669C25.5422 43.3334 24.9178 43.3349 24.4062 43.2931C23.8792 43.25 23.3546 43.1542 22.8502 42.8972C22.0979 42.5138 21.4863 41.9021 21.1028 41.1498C20.8458 40.6454 20.7501 40.1208 20.707 39.5938C20.6652 39.0823 20.6666 38.4579 20.6666 37.7332V26.267C20.6666 25.5423 20.6652 24.9179 20.707 24.4063C20.7501 23.8793 20.8458 23.3547 21.1028 22.8503C21.4863 22.0981 22.0979 21.4864 22.8502 21.103C23.3546 20.8459 23.8792 20.7502 24.4062 20.7071C24.9178 20.6653 25.5422 20.6668 26.2669 20.6668H41.733C42.4578 20.6668 43.0822 20.6653 43.5937 20.7071C44.1207 20.7502 44.6453 20.8459 45.1497 21.103C45.902 21.4864 46.5137 22.0981 46.8971 22.8503C47.1541 23.3547 47.2499 23.8793 47.2929 24.4063C47.3347 24.9179 47.3333 25.5423 47.3333 26.267V37.7332Z" fill="#00A38D"/>
            </svg>
<!--            <p class="font-semibold text-[18px] leading-5 text-custom-primary">{{'custom.no_deposits' | translate}}</p>-->
          <div>
            <p class="text-[18px] font-bold text-custom-primary">{{ 'custom.no_deposits' | translate }}</p>
            <p class="mt-2 text-[16px] text-custom-muted max-w-[390px]">{{ 'custom.deposit_empty_description' | translate }}</p>
          </div>
          </div>
        } @else {
          <app-data-state-wrapper
            [loading]="isFetching()"
            [totalLength]="contractList().length"
          >
            <app-deposit-table [activeTab]="activeTab()" [dataList]="contractList()" (pinClick)="getContractList()"></app-deposit-table>
          </app-data-state-wrapper>
        }
      </div>
    </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositMainComponent implements OnInit {
  private readonly depositService = inject(DepositService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analyticsService = inject(FirebaseAnalyticsService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isFetching = signal(false);
  contractList = signal<DepositItemDTO[]>([]);
  activeTab = signal<'active' | 'closed'>('active');

  tabs = [
    { title: 'deposits.active_tab', value: 'active' as const },
    { title: 'deposits.closed_tab', value: 'closed' as const },
  ];

  private currentFilters: { search?: string; depositType?: string; currency?: string } = {};

  ngOnInit(): void {
    this.analyticsService.logFirebaseCustomEvent('deposits_screen_jump', null);

    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const tab = params['tab'];

        if (tab === 'closed' || tab === 'active') {
          this.activeTab.set(tab);
        }

        this.getContractList();
      })
  }

  setActiveTab(value: 'active' | 'closed'): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: value },
      queryParamsHandling: 'merge'
    });
  }

  onFilterChange(filters: { searchText: string; depositType: string | null; currency: string | null }): void {
    this.currentFilters = {
      search: filters.searchText || undefined,
      depositType: filters.depositType || undefined,
      currency: filters.currency || undefined,
    };
    this.getContractList();
  }

  getContractList(): void {
    this.isFetching.set(true);
    const state = this.activeTab() === 'closed' ? 'CLOSE' : 'APPROVE';
    this.depositService.depositContactList(0, 100, this.currentFilters, state)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.contractList.set(res && res.content && res.content.length > 0 ? res.content : []);
          this.isFetching.set(false);
        },
        error: () => {
          this.isFetching.set(false);
        }
      });
  }
}
