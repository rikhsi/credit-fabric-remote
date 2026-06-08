import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ConditionField {
  label: string;
  value: string;
  icon?: string;
}

export interface TariffItem {
  title: string;
  subtitle: string;
}

export interface ConditionsModalData {
  title: string;
  description: ConditionField[];
  tariffs: TariffItem[];
}


@Component({
  selector: 'app-conditions-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    TranslateModule,
    MatDivider
  ],
  templateUrl: './conditions-modal.component.html',
  styleUrl:'./conditions-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionsModalComponent {
 activeTab = signal<'description' | 'tariffs'>('description');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConditionsModalData,
    private dialogRef: MatDialogRef<ConditionsModalComponent>
  ) {}

  setTab(tab: 'description' | 'tariffs') {
    this.activeTab.set(tab);
  }

  close() {
    this.dialogRef.close();
  }
}
