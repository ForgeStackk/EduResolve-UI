import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoubtService, DoubtResponse } from '../../../doubt.service';
import { ProgressBarComponent } from '../../student/progress-bar/progress-bar.component';

@Component({
  selector: 'app-doubt-solving',
  standalone: true,
  imports: [FormsModule, CommonModule, ProgressBarComponent],
  templateUrl: './doubt-solving.component.html',
  styleUrl: './doubt-solving.component.css'
})
export class DoubtSolvingComponent {
  doubtService = inject(DoubtService);
  
  query = signal('');
  isAsking = signal(false);
  response = signal<DoubtResponse | null>(null);
  feedbackSubmitted = signal(false);

  submitDoubt() {
    if (!this.query().trim()) return;
    
    this.isAsking.set(true);
    this.response.set(null);
    this.feedbackSubmitted.set(false);

    this.doubtService.askQuestion(this.query()).subscribe(res => {
      this.response.set(res);
      this.isAsking.set(false);
      this.query.set('');
    });
  }

  submitFeedback(isHelpful: boolean) {
    const currentRes = this.response();
    if (!currentRes) return;

    this.doubtService.submitFeedback(currentRes.id, isHelpful).subscribe(() => {
      this.feedbackSubmitted.set(true);
    });
  }
}