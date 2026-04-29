import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RequestStatus = 'Pending' | 'In-Review' | 'Resolved';

@Component({
  selector: 'app-status-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-tracker.component.html',
  styleUrl: './status-tracker.component.css'
})
export class StatusTrackerComponent {
  status = input.required<RequestStatus>();
  steps: RequestStatus[] = ['Pending', 'In-Review', 'Resolved'];

  private getStepIndex(s: RequestStatus): number {
    return this.steps.indexOf(s);
  }

  private getCurrentIndex(): number {
    return this.getStepIndex(this.status());
  }

  getStepClass(step: RequestStatus) {
    const idx = this.getStepIndex(step);
    const curr = this.getCurrentIndex();
    if (idx < curr) return 'bg-green-500 text-white shadow-sm';
    if (idx === curr) return 'bg-brand-orange text-white ring-4 ring-orange-100 shadow-sm';
    return 'bg-gray-200 text-gray-500';
  }

  getLineClass(step: RequestStatus) {
    return this.getStepIndex(step) < this.getCurrentIndex() ? 'bg-green-500' : 'bg-gray-200';
  }

  getTextClass(step: RequestStatus) {
    return this.getStepIndex(step) <= this.getCurrentIndex() ? 'text-brand-black' : 'text-gray-400';
  }
}
