import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeacherDataService } from '../../../teacher-data.service';

@Component({
  selector: 'app-homework-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './homework-management.component.html',
  styleUrl: './homework-management.component.css'
})
export class HomeworkManagementComponent {
  private fb = inject(FormBuilder);
  private teacherData = inject(TeacherDataService);

  homeworkForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    attachment: [null]
  });

  successMessage = '';

  onSubmit() {
    if (this.homeworkForm.valid) {
      const val = this.homeworkForm.value;
      this.teacherData.publishHomework({
        id: Math.random().toString(36).substring(2, 9),
        title: val.title!, description: val.description!, dueDate: new Date(val.dueDate!), hasAttachment: !!val.attachment
      });
      this.successMessage = '✓ Assigned to Student & Parent streams!';
      this.homeworkForm.reset();
      setTimeout(() => this.successMessage = '', 4000);
    }
  }
}