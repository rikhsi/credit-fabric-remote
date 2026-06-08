import {ApplyDepositComponent} from '../apply-deposit/apply-deposit.component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed, DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';
import {trigger, transition, style, animate} from '@angular/animations';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {DepositService} from "../../../services/deposit.service";
import {Subject, takeUntil} from "rxjs";
import {DepositDetailsDto} from "../../../models/deposits.model";
import {NgxMaskPipe} from "ngx-mask";
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
    ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AmountService} from "../../../../../../../core/services/amount.service";

@Component({
    selector: 'app-available-deposit-detail',
    imports: [
        CommonModule,
        MatRippleModule,
        MatTabsModule,
        UiSvgIconComponent,
        RouterModule,
        NgxMaskPipe,
        ContainerNavComponent,
        ContainerTitleComponent,
        NgOptimizedImage,
    ],
    templateUrl: './available-deposit-detail.component.html',
    styles: [
        `
      .active {
        background: #264796;
        color: white;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ transform: 'translateX(+100%)' }),
                animate('400ms ease-in', style({ transform: 'translateX(0%)' })),
            ]),
        ]),
    ]
})
export class AvailableDepositDetailComponent implements OnInit {
  title = signal<string >('')
  navs =computed(()=>[
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Доступные депозиты',
      link: '/deposits/available-deposits'
    },
    {
      title: this.title(),
      link: '/'
    },
  ])
  viewMode = 'terms';
  detailId = signal('')
  #destroy = inject(DestroyRef)
  detail = signal<DepositDetailsDto | null>(null)
  private _route = inject(ActivatedRoute)
  private depositService  = inject(DepositService)
  public amountService = inject(AmountService)

  ngOnInit(): void {
    this._route.params.subscribe(params => {
     if(params){
       this.detailId.set(params['id'])
       this.title.set(params['name'])
       this.getDepositDetail(this.detailId())
     }
    })

  }
  getDepositDetail(id: string) {
    this.depositService.getDepositInfo(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return
      this.detail.set(res)
    })
  }
}
