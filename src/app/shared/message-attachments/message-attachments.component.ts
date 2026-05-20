import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AttachmentInfo } from '../../core/api/student-inbox-api.service';

@Component({
  selector: 'app-message-attachments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-attachments.component.html'
})
export class MessageAttachmentsComponent {
  @Input() attachments: AttachmentInfo[] = [];

  url(attachmentId: string): string {
    return `${environment.apiBaseUrl}/v1/messages/attachments/${attachmentId}/content`;
  }
}
