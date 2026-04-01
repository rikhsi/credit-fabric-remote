import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactInfo, ExtraContacts, ExtraInfo, GeneralInfo, RequiredButtons } from '@pages/loan-application/components';

@Component({
  selector: 'cf-l-a-general',
  imports: [ContactInfo, GeneralInfo, ExtraContacts, ExtraInfo, RequiredButtons],
  templateUrl: './l-a-general.html',
  styleUrl: './l-a-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LAGeneral {}
