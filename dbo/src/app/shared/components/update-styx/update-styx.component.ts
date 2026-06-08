import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { StyxService } from '../../../core/services/styx.service';
import { UserInfoDto } from '../../../core/models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatLabel } from '@angular/material/select';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-update-styx',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatDialogClose,
        MatIcon,
        MatRipple,
        MatButton,
    ],
    templateUrl: './update-styx.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateStyxComponent implements OnInit {
  userInfo!: UserInfoDto;

  certForm = new FormGroup({
    phone: new FormControl(''),
    inn: new FormControl(''),
    password: new FormControl(''),
    pin: new FormControl(''),
  });

  step = 1;

  constructor(
    private destroyRef: DestroyRef,
    private userService: UserService,
    private styxService: StyxService,
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.userService.userInfo$$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if(data) {
          this.userInfo = data;
          console.log('userInfo', this.userInfo);
          this.certForm.patchValue({
            phone: `+${this.userInfo.userInfo.phoneNumber}`,
            inn: this.userInfo.business.inn,
          });
        }
      });
  }

  updateWS() {
    const payload = this.certForm.getRawValue() as any;
    this.styxService.getCertificateWS(payload)
      .then(res => {
        console.log('res', res);
        this.step = 2;
      });
  }

  update() {
    const payload = this.certForm.getRawValue() as any;
    this.styxService.getCertificate(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          console.log('data', data);
        },
        error: (err) => {
          console.log('err', err);
        }
      });
  }

  getInfo() {
    this.http.post('http://localhost:6210/crypto/getCertInfo', null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          console.log('data', data);
        },
        error: (err) => {
          console.log('err', err);
        }
      });
  }
}
