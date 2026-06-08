import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {ChatService} from '../../services/chat.service';
import {AccordionItems} from "../../models/faq.model";
import {Subject, takeUntil} from "rxjs";

@Component({
    selector: 'app-chat-faq',
    imports: [CommonModule, UiSvgIconComponent],
    templateUrl: './chat-faq.component.html',
    styles: `
    .acc-description {
      max-height: 0px;
      overflow: hidden;
      opacity: 0;
      padding: 0px;
      transition: opacity 0.2s ease-in, max-height 0.2s ease-in;
    }

    .expanded {
      opacity: 1;
      max-height: 118px;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatFaqComponent implements OnInit {
  faqs: AccordionItems[] = []
  unsub$ = new Subject<void>();
  expandedState: { [key: number]: boolean } = {};
  constructor(private chatService: ChatService, private cf:ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.getFaqList()
  }

  getFaqList() {
    this.chatService.getFAQList().pipe(takeUntil(this.unsub$)).subscribe((res)=>{
      if (!res) return
      this.faqs = res
      this.cf.detectChanges()
    })
  }

  toggleExpand(itemId: number) {
    this.expandedState[itemId] = !this.expandedState[itemId];
  }
  isExpanded(itemId: number): boolean {
    return this.expandedState[itemId];
  }
  expand(item: any, event: any) {
    const isExpand = event.currentTarget.nextSibling.classList.contains('expanded');
    if (isExpand) {
      event.currentTarget.nextSibling.classList.remove('expanded');
      item.isExpanded = false;
    } else {
      event.currentTarget.nextSibling.classList.add('expanded');
      item.isExpanded = true;

    }
  }
}
