import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionService } from '../../../../../core/services/transaction.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
    selector: 'app-event-calendar',
    templateUrl: './event-calendar.component.html',
    styleUrls: ['./event-calendar.component.scss'],
    imports: [
        FullCalendarModule,
        MatTooltipModule,
    ]
})
export class EventCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];
  calendarOptions: any;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.initCalendarOptions();
  }


  initCalendarOptions() {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      nowIndicator: true,
      height: 'auto',
      locale: 'ru',
      plugins: [dayGridPlugin],
      headerToolbar: {
        right: 'prev,next',
        left: 'title'
      },
      titleFormat: { year: 'numeric', month: 'short' },
      selectable: true,
      eventClick: this.eventClicked.bind(this),
      datesSet: this.onDatesSet.bind(this),
      eventDidMount: this.addTooltipToEvent.bind(this),
    };

  }

  show(event: any) {
    console.log(event);
  }

  from = '';
  to = '';
  currentYear!: number;

  onDatesSet(event: any) {
    const middate = new Date((event.start.getTime() + event.end.getTime()) / 2);
    const year = middate.getFullYear();
    if(year != this.currentYear) {
      this.currentYear = year;
      [this.from, this.to] = this.getStartToEndDate(this.currentYear);
      this.getTransactionCounts(this.from, this.to);
    }
  }

  eventClicked(event: any) {
    const startISO = event.event._instance.range.start.toISOString();
    const start = startISO.slice(0, 10);
    this.transactionService.transactionsHistoryRange.next({
      startDate: start,
      endDate: start
    });
    this.router.navigate(['/account-payment']).then(r => {
      if(r) {
        sessionStorage.setItem('transactionHistoryStartDate', start);
      } else {
        sessionStorage.removeItem('transactionHistoryStartDate');
      }
    });
  }

  getStartToEndDate(year: number): string[] {
    const startDate = `${year}-01-01T00:00:00`;
    const endDate = `${year}-12-31T23:59:59`;
    return [startDate, endDate];
  }

  getTransactionCounts(from: string, to: string) {
    this.transactionService.getTransactionsCounts(from, to)
      .pipe()
      .subscribe((data: any) => {
        const res = data.result.data;
        this.saveResToEvents(res);
      })
  }

  saveResToEvents(res: {[key: string]: number}) {
    const counts: any[] = [];
    for (const [key, val] of Object.entries(res)) {
      counts.push({
        start: key,
        title: val
      })
    }
    this.events = counts;
  }

  addTooltipToEvent(info: any) {
    info.el.setAttribute('title', 'Количество транзакций');
  }
}
