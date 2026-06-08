import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-template-name',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        MatFormFieldModule,
        FormsModule,
        MatInput,
    ],
    templateUrl: './template-name.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateNameComponent implements OnInit {
  name = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, agree: string, cancel: string, name: string },
    private matDialogRef: MatDialogRef<TemplateNameComponent>
  ) {
  }

  ngOnInit() {
    this.name = this.data.name;
  }

  onAgree() {
    this.matDialogRef.close(this.name);
  }
}
