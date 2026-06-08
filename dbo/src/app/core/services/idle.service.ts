import {inject, Injectable, signal} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IdleDialogComponent } from '../components/idle-dialog/idle-dialog.component';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private timeoutId: any;
  private readonly idleTime = 15 * 60 * 1000;
  private readonly events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];

  private dialogOpen = false;

  private dialog = inject(MatDialog);
  private userService = inject(UserService);

  constructor() {
  }


  startWatching(): void {
    // if (this.listening()) return;
    // this.listening.set(true);
    this.onActivity();
    this.events.forEach(event =>
      window.addEventListener(event, this.onActivity, true)
    );

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  stopWatching(): void {
    localStorage.removeItem("lastActivity")
    // this.listening.set(false);
    clearInterval(this.timeoutId);

    this.events.forEach(event =>
      window.removeEventListener(event, this.onActivity, true)
    );

    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }


  private onActivity = (): void => {
    this.updateActivity();
  };

  private updateActivity(): void {
    const difStore = localStorage.getItem("lastActivity");
    const diff = !difStore  ? Date.now() : Date.now() - JSON.parse(difStore);
    if (diff >= this.idleTime) {
      if (diff - this.idleTime > 10000) {
        this.userService.logout();
        this.stopWatching();
      } else {
        this.showIdleDialog();
      }
    } else {
      localStorage.setItem("lastActivity", JSON.stringify(Date.now()))
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.updateActivity(), this.idleTime);
    }
  }

  // private checkIdle(): void {
  //   const difStore = localStorage.getItem("lastActivity");
  //   const diff = !difStore  ? Date.now() : Date.now() - JSON.parse(difStore);
  //   console.log(diff, "diof")
  //   if (diff >= this.idleTime) {
  //     this.showIdleDialog();
  //   } else {
  //     this.timeoutId = setTimeout(
  //       () => this.checkIdle(),
  //       this.idleTime - diff
  //     );
  //   }
  // }


  private onVisibilityChange = (): void => {
    const diff = localStorage.getItem("lastActivity")

    if (
      document.visibilityState === 'visible' &&
      (!diff ? Date.now()  :  Date.now() - JSON.parse(diff)) >= this.idleTime
    ) {
      this.showIdleDialog();
    }
  };


  private showIdleDialog(): void {
    if (this.dialogOpen) return;
    this.dialogOpen = true;

    const dialogRef = this.dialog.open(IdleDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogOpen = false;

      if (result === 'stay') {
        localStorage.setItem("lastActivity", JSON.stringify(Date.now()))
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.updateActivity(), this.idleTime);
      } else {
        this.userService.logout();
        this.stopWatching();
      }
    });
  }
}
