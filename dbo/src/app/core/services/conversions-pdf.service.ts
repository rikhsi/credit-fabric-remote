import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = vfs;

@Injectable({
  providedIn: 'root'
})
export class ConversionsPdfService {

  downloadConversionApplication(data: any) {
    const documentDefinition = {
      content: [
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {},
                {text: 'Приложение № 2'}
              ],
              [
                {},
                {text: 'к Положению "О порядке проведения операций по конверсии иностранной валюты одного вида в иностранную валюту другого вида" в АКБ "HAMKOR BANK"'}
              ]
            ],
          },
          layout: 'noBorders',
          margin: [20, 20, 0, 40]
        },

        {
          text: 'ЗАЯВЛЕНИЕ',
          style: 'title',
          alignment: 'center',
        },
        {
          text: 'НА ОСУЩЕСТВЛЕНИЕ КОНВЕРСИОННОЙ ОПЕРАЦИИ',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Просим Вас сконвертировать ${data.senderAmount} (${data.senderCurrency}) в ${data.receiverAmount ?? data.senderAmount} ${data.receiverCurrency} по соответствующему курсу.`,
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['40%', '60%'],
            body: [
              [
                {text: 'Списать валюту со счета'},
                {}
              ],
              [
                {text: 'Счет в валюте:'},
                {text: `№ ${data.sender} МФО ${data.bankCode}`, margin: [0, 0, 0, 10]}
              ],

              [
                {text: 'Зачислить контрвалюту на счет'},
                {}
              ],
              [
                {text: 'Счет в контрвалюте:'},
                {text: `№ ${data.receiver} МФО ${data.bankCode}`, margin: [0, 0, 0, 20]}
              ]
            ]
          },
          layout: 'noBorders'
        },

        {
          text: `Время подачи/принятия заявления: ${this.formatDateForDocument(data.date)}`,
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [{ text: '(Юридическое лицо)' }, {}],
              [{}, {}],
              [{}, {}],
              [{ text: 'Руководитель', bold: true }, '(подпись)'],
              [{}, {}],
              [{}, {}],
              [{ text: 'Главный бухгалтер', bold: true }, '(подпись)'],
              [{}, {}],
              [{}, {}],
              [{ text: '(Физическое лицо)' }, {}],
              [{}, {}],
              [{}, {}],
              ['Ф.И.О.', 'подпись']
            ],
          },
          layout: 'noBorders',
          margin: [20, 20, 20, 20]
        }
      ],
      styles: {
        header: {
          fontSize: 12,
          bold: true
        },
        title: {
          fontSize: 14,
          bold: true
        },
        smallText: {
          fontSize: 10,
          width: 400,
          marginBottom: 20,
        }
      }
    };

    pdfMake.createPdf(documentDefinition as any).download('Conversion_Operation.pdf');
  }

  formatDateForDocument(date: string) {
    const now = new Date(date);

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);

    // Format the date as "__:__ часов ДД/ММ/ГГ"
    return `${hours}:${minutes} часов ${day}/${month}/${year}`;
  }

  downloadBuyCurrency(data: any) {
    const documentDefinition = {
      content: [
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {},
                {text: 'Приложение № 2'}
              ],
              [
                {},
                {text: 'к Публичному Договору-оферте от 15.02.2021г. об общих условиях осуществления операций по покупке или продаже инсотранной валюты'}
              ]
            ],
          },
          layout: 'noBorders',
          margin: [20, 20, 0, 40]
        },

        {
          text: 'ЗАЯВЛЕНИЕ',
          style: 'title',
          alignment: 'center',
        },
        {
          text: 'НА ПОКУПКУ ИНОСТРАННОЙ ВАЛЮТЫ',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            widths: ['40%', '60%'],
            body: [
              [
                {text: 'Наименование и ИНН заявителя'},
                {text: '' , style: 'leftColumn'}
              ],
              [
                {text: 'Почтовый адрес'},
                {text: '', style: 'leftColumn'}
              ],
              [
                {text: 'Номер телефона факса'},
                {text: '', style: 'leftColumn'}
              ],
              [
                {text: 'Ф.И.О. и должность сотрудника, уполномоченного на решение вопросов по сделке:'},
                {text: '', style: 'leftColumn'}
              ],
              [
                {text: 'Счет в сумах:'},
                {text: `№ ${data.sender} ${data.bankName ?? ''} ${data.bankCode}`, margin: [0, 0, 0, 10], style: 'leftColumn'}
              ],

              [
                {text: 'Счет в иностранной валюте:'},
                {text: `№ ${data.receiver} ${data.bankName ?? ''} ${data.bankCode}`, margin: [0, 0, 0, 20], style: 'leftColumn'}
              ],

              [
                {text: 'Социальный счет в иностранной валюте:'},
                {text: `№ ${data.receiver} ${data.bankName ?? ''} ${data.bankCode}`, margin: [0, 0, 0, 20], style: 'leftColumn'}
              ],
            ]
          },
          layout: 'noBorders'
        },

        {
          text: `Цель использования иностранной валюты (нужное подчеркнуть)`,
        },
        {
          ol: [
            { text: 'оборудование, комплектующие и запасные части;', style: 'orderedList' },
            { text: 'сырье и материалы;', style: 'orderedList' },
            { text: 'услуги;', style: 'orderedList' },
            { text: 'кредиты: гарантированные правительством;', style: 'orderedList' },
            { text: 'кредиты: негарантированные правительством;', style: 'orderedList' },
            { text: 'кредиты: выданные за счет собственных ресурсов Банка;', style: 'orderedList' },
            { text: 'медикаменты, лекарства и медицинские изделия;', style: 'orderedList' },
            { text: 'легковые автомобили;', style: 'orderedList' },
            { text: 'другие товары народного потребления;', style: 'orderedList' },
            { text: 'репатриация доходов;', style: 'orderedList' },
            { text: 'командировочные расходы;', style: 'orderedList' },
            { text: 'для других целей.', style: 'orderedList' },
          ]
        },
        {
          text: '(вид товара, наименование поставщика и страна, год поступления по ГТД если оплата по факту поставки, если оплата предоплата или аккредитив указать нужную, банк инопартнера и страна,  наименование грузоотправителя и страна,  Код ТНВЭД)'
        },
        {
          text: 'Поручаем заключить от нашего имени и за наш счет сделку на покупку иностранной валюты на нижеследующих условиях:'
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [{ text: 'Сумма  и наименование покупаемой валюты', bold: true }, { text: 'Курс покупки в сумах', bold: true }, { text: 'Общая сумма покупки в сумах по курсу', bold: true }],
              [{ text: '1' }, { text: '2' }, { text: '3' }],
              [{}, {}, {}],
            ],
          },
          margin: [10, 0, 0, 10]
        },

        {
          text: '№  и дата контракта'
        },
        {
          text: `Сумма (в национальной валюте – сумах) по указанному в заявке курсу в размере ${data.some} зарезервирована на счете №22613000%`
        },
        {
          text: `Поручаем списать с нашего спец. счета №22613000%_______________________ -  эквивалент в сумах купленной иностранной валюты по курсу покупки.`
        },
        {
          text: 'Прилагаются следующие документы:'
        },
        {
          ol: [
            {
              text: '___________'
            },
            {
              text: '___________'
            },
          ]
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: 'Директор'
                },
                {
                  text: '(подпись)'
                }
              ],

              [
                {
                  text: 'Главный бухгалтер'
                },
                {
                  text: '(подпись)'
                }
              ],

              [
                {
                  text: `${new Date().toLocaleString('ru-RU')}`
                },
                {
                  text: ''
                }
              ],
            ]
          },
          layout: 'noBorders'
        }
      ],
      styles: {
        header: {
          fontSize: 12,
          bold: true
        },
        title: {
          fontSize: 14,
          bold: true
        },
        smallText: {
          fontSize: 10,
          width: 400,
          marginBottom: 20,
        }
      }
    };

    pdfMake.createPdf(documentDefinition as any).download('buy_currency.pdf');
  }
}
