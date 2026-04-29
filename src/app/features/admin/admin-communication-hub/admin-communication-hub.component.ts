import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoticeApiService } from '../../../core/api/notice-api.service';

@Component({
  selector: 'app-admin-communication-hub',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-communication-hub.component.html',
  styleUrls: ['./admin-communication-hub.component.css']
})
export class AdminCommunicationHubComponent {
  private noticeApi = inject(NoticeApiService);

  audience = signal<string>('');
  message = signal<string>('');
  delivery = signal({ whatsapp: false, sms: false });
  isSending = signal<boolean>(false);

  handleToggle(method: 'whatsapp' | 'sms') {
    this.delivery.update((prev) => ({ ...prev, [method]: !prev[method] }));
  }

  handleSubmit() {
    if (!this.delivery().whatsapp && !this.delivery().sms) return;

    this.isSending.set(true);

    const currentDelivery = this.delivery();
    const channels = Object.keys(currentDelivery).filter(
      (key) => currentDelivery[key as keyof typeof currentDelivery]
    );

    this.noticeApi.send({
      targetAudience: this.audience(),
      message: this.message(),
      channels
    }).subscribe({
      next: () => {
        this.isSending.set(false);
        this.message.set('');
        this.delivery.set({ whatsapp: false, sms: false });
        this.audience.set('');
      },
      error: err => {
        console.error('Notice send failed', err);
        this.isSending.set(false);
      }
    });
  }
}