import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus } from '@api/models/los/application';

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
      case ApplicationStatus.OnFormFill: {
        return 'application.status.on_form_fill';
      }
      case ApplicationStatus.OnDecision: {
        return 'application.status.on_decision';
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
      case ApplicationStatus.Error: {
        return 'application.status.error';
      }
      default: {
        return 'application.status.unknown';
      }
    }
  }
}
