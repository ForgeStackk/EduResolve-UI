import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ActivityType =
  | 'CHAPTER_OPENED'
  | 'QUIZ_ATTEMPTED'
  | 'HOMEWORK_SUBMITTED'
  | 'DOUBT_ASKED'
  | 'DOUBT_RESOLVED';

export interface ActivityEvent {
  type: ActivityType;
  subjectId?: number;
  chapterId?: number;
  teacherUserId?: number;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class StudentActivityService {
  private _events = new Subject<ActivityEvent>();

  /** Stream that badge/streak/mission services subscribe to. */
  readonly events$ = this._events.asObservable();

  record(type: ActivityType, extras: Partial<Omit<ActivityEvent, 'type' | 'timestamp'>> = {}): void {
    this._events.next({ type, timestamp: new Date(), ...extras });
  }
}
