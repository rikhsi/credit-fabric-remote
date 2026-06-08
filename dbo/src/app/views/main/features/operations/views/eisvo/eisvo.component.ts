import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { OperationsService } from '../../services/operations.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IDN } from '../../interfaces/idn.interface';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { eisvoTableColumns } from '../../constants/table-columns';

@Component({
    selector: 'app-eisvo',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        ContainerTableComponent
    ],
    templateUrl: './eisvo.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EisvoComponent implements OnInit {
  idnc: IDN[] = [];
  loading = false;
  errorMessage = '';

  pageIndex = 0;
  pageSize = 20;
  totalElements = 0;

  title = 'Внешнеторговые контракты в ЕЭИСВО';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Валютные операции',
      link: '/operations'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  constructor(
    private _operationsService: OperationsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.getIdnc();
  }

  getIdnc() {
    this._operationsService.getIdns()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: val => {
          if(!val) return;
          this.idnc = val;
          this._cdRef.detectChanges();
        }
      })
  }

  protected readonly eisvoTableColumns = eisvoTableColumns;
}
