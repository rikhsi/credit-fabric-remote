import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ChildrenOutletContexts, NavigationEnd, Router, RouterModule } from '@angular/router';
import { routeAnimation } from 'src/app/core/animations/route.animation';
import { QuickActionsComponent } from '../main/components/quick-actions/quick-actions.component';
import { QuickAction } from '../../../../shared/interfaces/quick-action.interface';
import { AdditionalInfoComponent } from '../../../../shared/components/additional-info/additional-info.component';
import { operationsQuickActions } from './constants/quick-action-btns';
import { ApplicationsService } from '../applications/services/applications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import {
  OperationApplicationComponent
} from '../../../../shared/components/operation-application/operation-application.component';

@Component({
    selector: 'app-operations',
    animations: [routeAnimation],
    imports: [CommonModule, RouterModule],
    templateUrl: './operations.component.html',
    styles: [
        `
      :host {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 80px) !important;
      }
      .active {
        color: #007aff;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsComponent {
}
