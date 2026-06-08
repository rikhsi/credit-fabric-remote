import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { forkJoin, Subject, take, takeUntil } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { ScrollableDirective } from 'src/app/core/utils/scrollable.directive';

import { MyAutoDto, MyAutoInfo } from '../../models/transport.model';
import { TransportService } from '../../services/transport.service';
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-transport',
    imports: [CommonModule, UiSvgIconComponent, ScrollableDirective, MatRipple, MatIcon],
    templateUrl: './transport.component.html',
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ transform: 'translateX(+100%)' }),
                animate('400ms ease-in', style({ transform: 'translateX(0%)' })),
            ]),
        ]),
    ],
    styles: `
    .active {
      color: #007AFF;
    }

    .add-car {
      min-width: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .car-list {
      display: flex;
    }

    .car-item {
      padding: 12px;
      max-width: fit-content;
      min-width: max-content;
      transition: .4s linear;
    }

    .car-item:not(:last-child) {
      margin-right: 16px;
    }

    .car-number {
      min-width: 160px;
      font-weight: 500;
      //background: url('../../../../../../../../assets/icons/car_number_flag.svg') no-repeat 100% center;
      margin-bottom: 10px;
      transition: .4s linear;
    }

    .car-number .line {
      height: 100%;
      width: 1px;
      display: block;
      background: #000;
      margin: 0 4px;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransportComponent implements OnInit, OnDestroy {
  constructor(private transportService: TransportService, private _cf:ChangeDetectorRef) {};
  autoList!: MyAutoDto[];
  unsub$ = new Subject<void>();
  viewMode = 'insurance';
  selectedCarId: string = '';
  autoInfo: MyAutoInfo | null = null;
  isLoading = false;

  ngOnInit() {
    this.getAutoList();
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  getAutoList() {
    this.isLoading = true;
    this.transportService.getMyAutoList().pipe(takeUntil(this.unsub$)).subscribe(autoList => {
      if(!autoList) return;
      this.autoList = autoList.map(auto => ({
        ...auto,
        regionNum: auto.carNumber[0] + auto.carNumber[1],
        carNumber: auto.carNumber[2] && isNaN(+auto.carNumber[2])
                    ? `${auto.carNumber[2]} ${auto.carNumber.slice(3, 6)} ${auto.carNumber.slice(-2)}`
                    : `${auto.carNumber.slice(2, 5)} ${auto.carNumber.slice(-3)}`,
      }));
      this.selectedCarId = this.autoList[0]?.uuid;
      if(this.selectedCarId) {
        this.onSelectCar(this.selectedCarId);
      }
      this.isLoading = false;
    });
  }

  onSelectCar(uuid: string) {
    this.selectedCarId = uuid;
    forkJoin([
      this.transportService.getMyAutoInsurance(uuid),
      this.transportService.getMyAutoInfo(uuid),
    ]).pipe(takeUntil(this.unsub$))
    .subscribe(([insurance, info]) => {
      this.autoInfo = { insurance, info }
      this._cf.detectChanges()
    });
  }

  async onUpdateMyAutoList() {
    this.transportService.refreshLicense().pipe(take(1)).subscribe();
    this.autoList.forEach(auto => this.transportService.refreshInsurance(auto.uuid).pipe(take(1)).subscribe((res) => !!res && this.getAutoList()));
  }
}
