import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AdditionalInfoDetails } from './interfaces/additional-info.interface';
import { AdditionalInfoCardComponent } from './components/additional-info-card/additional-info-card.component';

@Component({
    selector: 'app-additional-info',
    imports: [
        NgOptimizedImage,
        AdditionalInfoCardComponent
    ],
    templateUrl: './additional-info.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalInfoComponent {
  additionalInfo: AdditionalInfoDetails[] = [
    {
      title: 'Банки-корреспонденты',
      isDownload: true,
      href: './assets/pdf/correspondent_banks.pdf',
      example: 'Посмотреть список',
      isHref: true,
    },
    {
      title: 'Санкционные банки',
      isDownload: true,
      href: './assets/pdf/sanctioned_banks.pdf',
      example: 'Посмотреть список',
      isHref: true,
    },
    {
      title: 'Образец заполнения заявки на покупку',
      isDownload: true,
      href: './assets/pdf/buy_currency_example.doc',
      example: 'Образец',
      linkText: 'Смотреть инструкцию',
      isLink: true,
      isExample: true,
      reference: 'https://hamkor.uz/ru/corporate/currency/'
    },
    {
      title: 'Образец заполнения платежного поручения',
      isDownload: true,
      href: './assets/pdf/payment_order_example.doc',
      isExample: true,
    },
    {
      title: 'Образец заполнения платёжного поручения в российских рублях',
      isDownload: true,
      href: './assets/pdf/payment_order_rub_example.pdf',
      isExample: true,
    },
    {
      title: 'Образец заполнения заявки на продажу',
      isDownload: true,
      href: './assets/pdf/sell_currency_example.doc',
      isExample: true,
    },
    {
      title: 'Тарифы',
      href: 'https://hamkor.uz/ru/corporate/tariffs/2742/37093/',
      isLink: true,
      linkText: 'Посмотреть'
    },
  ]

}
