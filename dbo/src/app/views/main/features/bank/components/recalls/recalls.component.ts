import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { Recall } from '../../interfaces/ept.interface';
import { EptService } from '../../../../../../core/services/ept.service';
import {
  ActivatedRoute,
  RouterLinkActive
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { TableActionsComponent } from '../../../../../../shared/components/table-actions/table-actions.component';
import { RecallTableActions } from '../../constants/table-btns';
import { recallTableColumns } from '../../constants/table-columns';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';

@Component({
    selector: 'app-recalls',
    imports: [
        ContainerTableComponent,
        FilterButtonComponent,
        PaginatorComponent,
        RouterLinkActive,
        TableActionsComponent,
        ContainerTitleComponent,
        ContainerNavComponent
    ],
    templateUrl: './recalls.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecallsComponent implements OnInit {
  title = 'Отзывы'
  navs: { title: string, link: string, tab?: string }[] = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'ЭПТ',
      link: '/bank'
    },
    {
      title: 'Входящие',
      link: '/bank?tab=I'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  tab = '';

  errorMessage = '';
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  recalls: Recall[] = [];
  loading = false;

  filterState = false;

  constructor(
    private destroyRef: DestroyRef,
    private eptService: EptService,
    private _cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.watchRoute();
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(param => {
        this.tab = param['tab'];
        const title = this.tab === 'I' ? 'Входящие' : 'Исходящие';
        this.navs[2] = {
          title: title,
          link: '/bank',
          tab: this.tab
        };
        this._cdRef.detectChanges();
        this.getRecalls();
      });
  }

  getRecalls() {
    this.loading = true;
    this.eptService.getRecallByClientId(this.tab)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(!res) return;
          this.recalls = res;
          this.loading = false;
          this._cdRef.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.message || err || 'Что-то пошло не так...';
          this.loading = false;
          this._cdRef.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this._cdRef.detectChanges();
        }
      })
  }

  recallClicked(event: any) {

  }

  onSelectedRows(event: any) {}

  onActionClick(event: any) {
  }

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getRecalls();
  }

  protected readonly RecallTableActions = RecallTableActions;
  protected readonly recallTableColumns = recallTableColumns;
}
