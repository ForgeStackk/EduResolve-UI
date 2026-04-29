import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HomeworkApiService, Homework as ApiHomework } from './core/api/homework-api.service';

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  hasAttachment: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherDataService {
  private api = inject(HomeworkApiService);
  private homeworkStream = new BehaviorSubject<Homework[]>([]);
  homework$ = this.homeworkStream.asObservable();

  /** Fetches latest homework from API and updates the stream. */
  refresh(): void {
    this.api.list().subscribe(rows => {
      this.homeworkStream.next(rows.map(this.toUi));
    });
  }

  /** Posts to API and prepends the new homework to the stream. */
  publishHomework(hw: Homework): void {
    const payload: ApiHomework = {
      title: hw.title,
      description: hw.description,
      dueDate: this.toIsoDate(hw.dueDate),
      hasAttachment: hw.hasAttachment
    };
    this.api.create(payload).subscribe(saved => {
      this.homeworkStream.next([this.toUi(saved), ...this.homeworkStream.value]);
    });
  }

  private toUi = (api: ApiHomework): Homework => ({
    id: String(api.id ?? ''),
    title: api.title,
    description: api.description,
    dueDate: api.dueDate ? new Date(api.dueDate) : new Date(),
    hasAttachment: !!api.hasAttachment
  });

  private toIsoDate(d: Date): string {
    if (!(d instanceof Date) || isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  }
}