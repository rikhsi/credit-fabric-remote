import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ITab } from '../../interfaces/tab.interface';
import { OperationsService } from '../../../views/main/features/operations/services/operations.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tabs',
    imports: [
        NgClass
    ],
    templateUrl: './tabs.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements OnInit {
  @Input() tabs: ITab[] = [];
  @Output() tabChange = new EventEmitter();
  selectedTab!: ITab;

  constructor(
    private _cdRef: ChangeDetectorRef,
    private operationService: OperationsService,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit() {
    this.selectTab(this.tabs[0]);
    this.updateTab();
  }

  selectTab(tab: ITab) {
    this.selectedTab = tab;
    this.tabChange.emit(tab);
  }

  updateTab() {
    this.operationService.conversionTemplate
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: any) => {
        const account_56d = val?.additionalInfo?.account_56d;
        const account_57d = val?.additionalInfo?.account_57d;
        if(account_56d || account_57d) {
          this.selectTab(this.tabs[1]);
        }
        const bicorbei_56a = val?.additionalInfo?.bicorbei_56a;
        const bicorbei_57a = val?.additionalInfo?.bicorbei_57a;
        if(bicorbei_56a || bicorbei_57a) {
          this.selectTab(this.tabs[0]);
        }
      })
  }
}
