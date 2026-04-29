import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

export interface ComplaintRequest {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In-Review' | 'Resolved';
  date: Date;
}

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complaint-form.component.html',
  styleUrl: './complaint-form.component.css'
})
export class ComplaintFormComponent {
  private fb = inject(FormBuilder);
  onSubmitRequest = output<ComplaintRequest>();

  form = this.fb.group({
    category: ['', Validators.required],
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;
    this.onSubmitRequest.emit({
      id: Math.random().toString(36).substring(2, 9),
      category: val.category!,
      subject: val.subject!,
      description: val.description!,
      status: 'Pending',
      date: new Date()
    });
    this.form.reset({ category: '' });
  }
}
