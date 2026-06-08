import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { EptDoc } from '../../interfaces/ept.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EptService } from '../../../../../../core/services/ept.service';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cancel-ept',
  standalone: true,
  imports: [
    ContainerNavComponent,
    ContainerTitleComponent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    MatError,
    NgIf,
  ],
  templateUrl: './cancel-ept.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelEptComponent {
  title = 'Отклонить';
  navs: { title: string, link: string, tab?: string }[] = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'ЭПТ',
      link: '/bank'
    },
    {
      title: 'Входящие',
      link: '/bank?tab=I'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  ept!: EptDoc;

  cancelForm = new FormGroup({
    amount: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  constructor(
    private destroyRef: DestroyRef,
    private eptService: EptService,
  ) {
  }


  send() {
    this.cancelForm.markAllAsTouched();
    if(this.cancelForm.invalid) return;
    const payload = this.cancelForm.getRawValue();
    payload.amount = `${Number(payload.amount) * 100}`;
  }
}
