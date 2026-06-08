import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  output,
  Output
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatInput} from "@angular/material/input";
import {MatLabel} from "@angular/material/form-field";
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ToastrService} from "ngx-toastr";
import {MatIcon} from "@angular/material/icon";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-title-change-card',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
    MatDialogClose,
    TranslateModule
  ],
  templateUrl: './title-change-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleChangeCardComponent implements OnInit {
  data: { title: string | undefined, uuid: string | undefined } = inject(MAT_DIALOG_DATA)
  change = output<void>()
  private readonly cardService = inject(SalaryProjectService)
  readonly destroy = inject(DestroyRef)
  readonly toast = inject(ToastrService)
  private translateService = inject(TranslateService)
  titleFrom = new FormGroup({
    uuid: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
  })

  ngOnInit() {
    this.titleFrom.patchValue({
      uuid: this.data.uuid,
      title: this.data.title
    })
  }

  submit() {
    if (this.titleFrom.valid) {
      this.cardService.changeTitle(this.titleFrom.value).pipe(takeUntilDestroyed(this.destroy)).subscribe(res => {
        if (!res) return
        this.toast.success(this.translateService.instant('messages.SUCCESS'))
        this.change.emit()
      })
    }
  }

}
