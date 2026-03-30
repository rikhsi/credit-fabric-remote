import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age',
})
export class AgePipe implements PipeTransform {
  transform(birthday: Date | null | undefined): number | null {
    if (birthday == null) return null;

    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= 0 ? age : null;
  }
}
