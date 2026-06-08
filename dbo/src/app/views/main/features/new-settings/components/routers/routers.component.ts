import {Component, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {NewSettingsService} from "../../services/new-settings.service";
import {FormsModule} from "@angular/forms";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: "app-organization",
  templateUrl: "./routers.component.html",
  styleUrls: ["./routers.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
  ]
})

export class RoutersComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  selected = false
  editing =false;
  errorMessage = signal<string>("");
  routerInfoItems = signal<any>(null);
  selectedRouterId: string | null = null;
  constructor(
    public router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private newSettingsService: NewSettingsService,
    private toastrService: ToastrService,
  ) {

  }
  ngOnInit() {
    this.loadRouters()
  }
  loadRouters() {
    this.newSettingsService.getRouterList().pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(5556, res)
          if (res?.success) {
            this.routerInfoItems.set(res?.result?.data || null);
            const usedItem = this.routerInfoItems().find((i) => i.isUsed);
            this.selectedRouterId = usedItem ? usedItem.uuid : null;
          } else {
            this.errorMessage.set(res?.result?.message || '');
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
        }
      });

      // .subscribe(res => {
      //   this.routerInfoItems.set(res || null);
      //   const usedItem = this.routerInfoItems().find((i) => i.isUsed);
      //   this.selectedRouterId = usedItem ? usedItem.uuid : null;
      // });
  }
  toggleEditing() {
    this.editing = !this.editing;
    if (!this.editing) {
      this.selectedRouterId = null;
    }
  }

  save() {
    if (this.selectedRouterId !== null) {
      // this.newSettingsService.attachSignOrder({signId: this.selectedRouterId})
      //   .pipe(take(1))
      //   .subscribe(res => {
      //     console.log(333, res)
      //     this.editing = false;
      //     this.loadRouters()
      //     if (res?.msg) {
      //       this.toastrService.info(res.msg);
      //     }
      //   });
    }
  }
}
