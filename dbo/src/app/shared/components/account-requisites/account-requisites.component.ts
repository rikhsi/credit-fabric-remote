import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import {NgClass, NgOptimizedImage} from '@angular/common';

@Component({
    selector: 'app-account-requisites',
    imports: [
        MatAccordion,
        MatExpansionPanel,
        NgClass,
        NgOptimizedImage
    ],
    templateUrl: './account-requisites.component.html',
    styles: ``,
    styleUrls: ['./account-requisites.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountRequisitesComponent implements OnInit {
  isOpenRequisites = false;
  businessUser!: any;

  @Input() wrapperClass = '';

  constructor(
    private userService: UserService,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit() {
    this.getBusinessUserInfo();
  }

  toggleRequisites() {
    this.isOpenRequisites = !this.isOpenRequisites;
  }

  getBusinessUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.businessUser = res?.business;
      });
  }
}
