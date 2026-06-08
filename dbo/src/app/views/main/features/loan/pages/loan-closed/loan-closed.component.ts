import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLinkWithHref } from '@angular/router';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { environment } from 'src/environments/environment';
import { LoanFilterComponent } from '../../components/loan-filter/loan-filter.component';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MinorToMajorPipe } from 'src/app/shared/lib/minor-to-major.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {UserService} from "../../../../../../core/services/user.service";
import { MatMenuModule } from '@angular/material/menu';
import { LoanService } from '../../../loans/services/loan.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Loan } from '../../../loans/models/loan.model';
import { LoanLogicService } from '../../services/loan-logic.service';
@Component({
  selector: 'app-loan-closed',
  imports: [
        MatIconModule,
        SvgIconComponent,
        LoanFilterComponent,
        MatDividerModule,
        CommonModule,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        RouterLinkWithHref,
        PaginationComponent,
        MinorToMajorPipe,
        TranslateModule,
        MatTooltipModule,
        MatMenuModule,
        AsyncPipe
  ],
  providers:[LoanLogicService],
  templateUrl: './loan-closed.component.html',
  styles: `
    .mat-menu-button app-svg-icon {
      transition: color 0.3s ease;
    }

    .mat-menu-button:hover app-svg-icon {
      color: #00A38D;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanClosedComponent implements OnDestroy , OnInit{
  readonly SVG_URL = environment.SVG_URL
  public userService = inject(UserService)
 
  tableData = signal<any[]>([1,2,3])
  totalElements = signal(0)
  readonly loanService  = inject(LoanService);
  readonly destroyRef = inject(DestroyRef);
  public loanLogicService = inject(LoanLogicService)


  loanData = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null)

  ngOnInit(): void {
    this.loanLogicService.initForm('CLOSE');
    this.loanLogicService.buildFilterStream(this.loanService)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res) => {
      if (res) {
        this.loanData.set(res.content);
        this.totalElements.set(res.totalCount);
      }
    });

  }

  ngOnDestroy(): void {
    this.loanService.setIsLoanEmpty(false)
  }

  
  openDetail(event:Event,loan:Loan) {
    event.stopPropagation();
    this.selectedLoan.set(loan)
    localStorage.setItem('loanData', JSON.stringify(loan))
    this.loanLogicService.openDetail(event,loan.loanId)
  };

}
