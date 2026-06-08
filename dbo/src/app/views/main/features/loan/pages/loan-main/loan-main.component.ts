import { AsyncPipe, NgIf } from '@angular/common';
import { LoanLogicService } from './../../services/loan-logic.service';
import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FirebaseAnalyticsService } from 'firebase-analytics.service';
import { LoanService } from '../../../loans/services/loan.service';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loan-main',
  imports: [
    RouterLinkActive,
    RouterOutlet,
    RouterLink,
    TranslateModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './loan-main.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanMainComponent {
  constructor(
    private analyticsService: FirebaseAnalyticsService,
      private translate: TranslateService,
      public loanService:LoanService,
      private activatedRoute:ActivatedRoute,
        private router: Router,

  ) {}
  
  routeChange = toSignal(this.router.events);

  tabEffect = effect(() => {
    this.routeChange();
    const tab = this.activatedRoute.firstChild?.snapshot.url[0]?.path;
    if (tab === 'my' || tab === 'closed') {
      this.loanService.activeTab.set(tab as 'my' | 'closed');
    }
  });



  ngOnInit(): void {
    this.analyticsService.logFirebaseCustomEvent('credits_screen_jump', null);
      
    const initialTab = this.activatedRoute.firstChild?.snapshot.url[0]?.path;
    this.loanService.activeTab.set(
      (initialTab === 'my' || initialTab === 'closed') ? initialTab : 'my'
    );
  }
    tabs = [
      { title: this.translate.instant('deposits.active_tab'), value: 'my' },
      { title: this.translate.instant('deposits.closed_tab'), value: 'closed' },
    ];

    setActiveTab(value:any) {
        this.loanService.activeTab.set(value)
    }

}
