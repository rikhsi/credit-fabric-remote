import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus } from '@api/models/los';

@Pipe({ name: 'applicationStatus' })
export class ApplicationStatusPipe implements PipeTransform {
  transform(value: ApplicationStatus): string {
    switch (value) {
      case ApplicationStatus.InProgress: {
        return 'application.status.in_progress';
      }
      case ApplicationStatus.Approved: {
        return 'application.status.approved';
      }
      case ApplicationStatus.OnDesign: {
        return 'application.status.on_design';
      }
      case ApplicationStatus.OnAssign: {
        return 'application.status.on_assign';
      }
      case ApplicationStatus.Signed: {
        return 'application.status.signed';
      }
      case ApplicationStatus.Decline: {
        return 'application.status.decline';
      }
      case ApplicationStatus.DeclineClient: {
        return 'application.status.decline_client';
      }
      case ApplicationStatus.Issued: {
        return 'application.status.issued';
      }
      default: {
        return 'application.status.unknown';
      }
    }
  }
}
