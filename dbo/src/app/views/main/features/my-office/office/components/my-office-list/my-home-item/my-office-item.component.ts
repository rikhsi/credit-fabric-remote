import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerToggleIcon } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import { OfficeService } from '../../../service/office.service';
import { MyOfficeItem } from '../../../types/my-office.type';

@Component({
    selector: 'app-my-office-item',
    templateUrl: './my-office-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, MatRippleModule, UiSvgIconComponent, MatDatepickerToggleIcon, NgClass, MatIcon, MatMenuTrigger, MatMenu]
})
export class MyOfficeItemComponent {
  @Input() public office: MyOfficeItem | undefined;
  @Input() public selected: MyOfficeItem | undefined;
  @Output() actions  = new EventEmitter<string>()
  isMore = false;
  public constructor(private _office: OfficeService, private _cdRef: ChangeDetectorRef,) {
  }
  public setOffice(office: MyOfficeItem): void {
  if (office.uuid !== this._office.office?.uuid)
    this._office.office = office
    this._cdRef.detectChanges();
  }
doAction(type:string){
    switch (type){
      case 'edit':
        return this.actions.emit('edit')
      case 'delete':
        return this.actions.emit('delete')
    }
}
}
