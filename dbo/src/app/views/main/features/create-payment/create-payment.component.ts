import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDatepickerToggleIcon } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { DropDownAnimation } from 'src/app/core/animations/menu.animation';
import { routeAnimation } from 'src/app/core/animations/route.animation';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import { PaymentBudgetComponent } from './components/payment-budget/payment-budget.component';
import { PaymentCounteragentComponent } from './components/payment-counteragent/payment-counteragent.component';
import { PaymentJkuComponent } from './components/payment-jku/payment-jku.component';
import { PaymentTemplateComponent } from './components/payment-template/payment-template.component';

@Component({
    selector: 'app-create-payment',
    animations: [routeAnimation, DropDownAnimation],
    imports: [
        UiSvgIconComponent,
        PaymentCounteragentComponent,
        PaymentTemplateComponent,
        UiSvgIconComponent,
        MatIcon,
        PaymentJkuComponent,
        PaymentBudgetComponent,
        RouterModule,
        MatDatepickerToggleIcon,
    ],
    templateUrl: './create-payment.component.html',
    styles: [
        `
      .common-inner-tabs {
        .mdc-tab-indicator {
          display: flex;
        }
        .mdc-tab-indicator .mdc-tab-indicator__content {
          margin-bottom: -2px;
        }
        .mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
        .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
          color: #000;
        }

        .mat-mdc-tab-labels {
          border-bottom: 2px solid #dbdbdb;
        }
        .mat-mdc-tab .mdc-tab-indicator__content--underline {
          border-color: #007aff;
        }
        .mat-mdc-tab:focus .mdc-tab-indicator__content--underline {
          border-color: #007aff;
        }
        .mat-mdc-tab.mdc-tab {
          height: 35px;
        }
        .mat-mdc-tab .mdc-tab__text-label {
          color: #000;
        }
      }
      .payment-mat-date,
      .payment-select {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #dbdbdb !important;
        }
        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 10px !important;
        }
        .mat-mdc-select-arrow {
          display: none;
        }
        .mat-mdc-form-field-flex {
          height: 44px;
          padding: 8px;
        }
        .mat-mdc-form-field-infix {
          padding-top: 16px;
          top: -15px;
        }
        .mat-mdc-select-placeholder,
        .mat-mdc-form-field-input-control,
        .mat-mdc-select-value-text {
          color: #000;
        }
        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }
        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
      }
      .payment-currency-select {
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }
        padding-left: 25px;
        font-size: 14px;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreatePaymentComponent {
  menuList = [
    {
      title: 'Выплата по зарплатному проекту',
      route: 'salary',
    },
    // {
    //   title: 'Перевод между своими счетами',
    //   route: 'transfer-accounts',
    // },
    {
      title: 'Перевод с транзитного счёта',
      route: 'transfer-transit',
    },
    {
      title: 'Покупка и продажа валюты',
      route: 'currency-operations',
    },
    {
      title: 'Валютный перевод',
      route: 'currency-transfer',
    },
    {
      title: 'Пополнение бизнес-карт',
      route: 'card-topup',
    },
    {
      title: 'Платёжное требование',
      route: 'requirements',
    },
    {
      title: 'Инкассовое поручение',
      route: 'collection-order',
    },
    {
      title: 'Выставить счёт на оплату',
      route: 'issue-invoice',
    },
    {
      title: 'Автоакцепт',
      route: 'auto-acceptance',
    },
    {
      title: 'Покупка и продажа металла',
      route: 'metal-operations',
    },
  ];
  constructor(private _contexts: ChildrenOutletContexts) {}
  isMore = false;
  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }
}
