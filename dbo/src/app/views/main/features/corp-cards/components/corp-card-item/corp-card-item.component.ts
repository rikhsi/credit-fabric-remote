import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {CorpCardListDto} from "../../models/corp-card.model";
import {CorpCardService} from "../../services/corp-card.service";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NgxMaskPipe} from "ngx-mask";
import {NgClass} from "@angular/common";

@Component({
    selector: 'app-corp-card-item',
    imports: [
        MatMenuTrigger,
        UiSvgIconComponent,
        MatMenu,
        NgxMaskPipe,
        NgClass
    ],
    templateUrl: './corp-card-item.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardItemComponent {
  @Input() public corpCard  = {} as CorpCardListDto
  @Input() public selected = {} as CorpCardListDto

  constructor(private _cdRef:ChangeDetectorRef,private _corpCardService: CorpCardService) {
  }
  public setCorpCard(card: CorpCardListDto): void {
    if (card.uuid !== this._corpCardService.card?.uuid)
      this._corpCardService.card = card
    this._cdRef.detectChanges();
  }
  getStatus(status: string) {
    switch (status) {
      case 'ACTIVE':
        return 'Активный'
      case 'WAITING':
        return 'В ожидании'
      case 'BLOCKED':
        return 'Заблокировано'
      case 'LOCKED':
        return 'Заблокировано'
      case 'DELETED':
        return 'Удалено'
      case 'WARNING':
        return 'Предупреждение'
    }
    return status
  }
}
