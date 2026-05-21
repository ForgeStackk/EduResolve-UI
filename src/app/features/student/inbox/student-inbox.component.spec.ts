import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { StudentInboxComponent } from './student-inbox.component';
import {
  StudentInboxApiService,
  StudentInboxItem,
  AttendanceDayDto
} from '../../../core/api/student-inbox-api.service';
import { InboxWebSocketService } from '../../../core/inbox/inbox-websocket.service';

function inboxItem(
  overrides: Partial<StudentInboxItem> = {}
): StudentInboxItem {
  return {
    inboxId: 'inbox-1',
    messageId: 'msg-1',
    senderName: 'Ms. Priya',
    category: 'CLASS_NOTICE',
    targetSubjectId: null,
    subjectName: null,
    textBody: 'Hello class',
    contentType: 'TEXT',
    sentAt: new Date().toISOString(),
    isHomework: false,
    homeworkDueDate: null,
    readStatus: 'UNREAD',
    attachments: [],
    ...overrides
  };
}

describe('StudentInboxComponent', () => {
  let component: StudentInboxComponent;
  let fixture: ComponentFixture<StudentInboxComponent>;
  let apiSvc: jasmine.SpyObj<StudentInboxApiService>;
  let wsSvc: jasmine.SpyObj<InboxWebSocketService>;

  beforeEach(async () => {
    apiSvc = jasmine.createSpyObj('StudentInboxApiService',
      ['getInbox', 'markRead', 'getUnreadCount', 'getAttendance']);
    wsSvc  = jasmine.createSpyObj('InboxWebSocketService', ['clearBadge']);

    apiSvc.getInbox.and.returnValue(of([]));
    apiSvc.getAttendance.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [StudentInboxComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
        { provide: StudentInboxApiService, useValue: apiSvc },
        { provide: InboxWebSocketService,  useValue: wsSvc  }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls getInbox and getAttendance on init', () => {
    expect(apiSvc.getInbox).toHaveBeenCalled();
    expect(apiSvc.getAttendance).toHaveBeenCalled();
    expect(wsSvc.clearBadge).toHaveBeenCalled();
  });

  it('default active tab is notifications', () => {
    expect(component.activeTab()).toBe('notifications');
  });

  // ── tab switching ─────────────────────────────────────────────────────────

  it('setTab changes activeTab signal', () => {
    component.setTab('homework');
    expect(component.activeTab()).toBe('homework');
  });

  it('setTab to classNotices changes tab', () => {
    component.setTab('classNotices');
    expect(component.activeTab()).toBe('classNotices');
  });

  // ── computed sections ─────────────────────────────────────────────────────

  it('notifications computed filters ABSENCE_NOTIFICATION items', () => {
    component.items.set([
      inboxItem({ category: 'ABSENCE_NOTIFICATION', inboxId: 'a' }),
      inboxItem({ category: 'CLASS_NOTICE', inboxId: 'b' })
    ]);
    expect(component.notifications().length).toBe(1);
    expect(component.notifications()[0].inboxId).toBe('a');
  });

  it('classNotices computed filters CLASS_NOTICE items', () => {
    component.items.set([
      inboxItem({ category: 'CLASS_NOTICE', inboxId: 'c1' }),
      inboxItem({ category: 'CLASS_NOTICE', inboxId: 'c2' }),
      inboxItem({ category: 'HOMEWORK', inboxId: 'h1' })
    ]);
    expect(component.classNotices().length).toBe(2);
  });

  it('homeworkItems groups by subject', () => {
    component.items.set([
      inboxItem({ category: 'HOMEWORK', targetSubjectId: 1, subjectName: 'Math', inboxId: 'hw1' }),
      inboxItem({ category: 'HOMEWORK', targetSubjectId: 1, subjectName: 'Math', inboxId: 'hw2' }),
      inboxItem({ category: 'HOMEWORK', targetSubjectId: 2, subjectName: 'Science', inboxId: 'hw3' })
    ]);
    const groups = component.homeworkItems();
    expect(groups.length).toBe(2);
    const mathGroup = groups.find(g => g.subject === 'Math');
    expect(mathGroup?.items.length).toBe(2);
  });

  // ── badges ────────────────────────────────────────────────────────────────

  it('notifBadge counts unread ABSENCE_NOTIFICATION items', () => {
    component.items.set([
      inboxItem({ category: 'ABSENCE_NOTIFICATION', readStatus: 'UNREAD' }),
      inboxItem({ category: 'ABSENCE_NOTIFICATION', readStatus: 'READ', inboxId: 'r' })
    ]);
    expect(component.notifBadge()).toBe(1);
  });

  it('classBadge counts unread CLASS_NOTICE items', () => {
    component.items.set([
      inboxItem({ category: 'CLASS_NOTICE', readStatus: 'UNREAD', inboxId: 'u1' }),
      inboxItem({ category: 'CLASS_NOTICE', readStatus: 'UNREAD', inboxId: 'u2' })
    ]);
    expect(component.classBadge()).toBe(2);
  });

  // ── markRead ──────────────────────────────────────────────────────────────

  it('markRead skips API call if item is already READ', () => {
    const item = inboxItem({ readStatus: 'READ' });
    component.markRead(item);
    expect(apiSvc.markRead).not.toHaveBeenCalled();
  });

  it('markRead calls API and updates readStatus on success', fakeAsync(() => {
    const item = inboxItem({ readStatus: 'UNREAD', inboxId: 'inbox-mark' });
    component.items.set([item]);
    apiSvc.markRead.and.returnValue(of(undefined));

    component.markRead(item);
    tick();

    expect(apiSvc.markRead).toHaveBeenCalledWith('inbox-mark');
    expect(component.items()[0].readStatus).toBe('READ');
  }));

  // ── attendance navigation ─────────────────────────────────────────────────

  it('prevMonth decrements month', () => {
    component.attendanceMonth.set(3);
    component.attendanceYear.set(2025);
    component.prevMonth();
    expect(component.attendanceMonth()).toBe(2);
    expect(component.attendanceYear()).toBe(2025);
  });

  it('prevMonth wraps from January to December of previous year', () => {
    component.attendanceMonth.set(1);
    component.attendanceYear.set(2025);
    component.prevMonth();
    expect(component.attendanceMonth()).toBe(12);
    expect(component.attendanceYear()).toBe(2024);
  });

  it('nextMonth increments month', () => {
    component.attendanceMonth.set(5);
    component.attendanceYear.set(2025);
    component.nextMonth();
    expect(component.attendanceMonth()).toBe(6);
  });

  it('nextMonth wraps from December to January of next year', () => {
    component.attendanceMonth.set(12);
    component.attendanceYear.set(2025);
    component.nextMonth();
    expect(component.attendanceMonth()).toBe(1);
    expect(component.attendanceYear()).toBe(2026);
  });

  it('currentMonthLabel returns formatted month + year', () => {
    component.attendanceMonth.set(5);
    component.attendanceYear.set(2025);
    expect(component.currentMonthLabel()).toBe('May 2025');
  });

  // ── formatDate / formatDay ────────────────────────────────────────────────

  it('formatDate returns localised string', () => {
    const result = component.formatDate('2025-05-01T00:00:00Z');
    expect(result.length).toBeGreaterThan(0);
  });

  it('isDue returns true for past due date', () => {
    expect(component.isDue('2000-01-01')).toBeTrue();
  });

  it('isDue returns false for future due date', () => {
    expect(component.isDue('2099-12-31')).toBeFalse();
  });

  it('isDue returns false for null', () => {
    expect(component.isDue(null)).toBeFalse();
  });

  // ── attendanceColor ───────────────────────────────────────────────────────

  it('attendanceColor returns correct color for PRESENT', () => {
    expect(component.attendanceColor('PRESENT')).toBe('#10b981');
  });

  it('attendanceColor falls back to gray for unknown status', () => {
    expect(component.attendanceColor('UNKNOWN')).toBe('#6b7280');
  });

  // ── countStatus ───────────────────────────────────────────────────────────

  it('countStatus counts attendance records by status', () => {
    component.attendance.set([
      { date: '2025-05-01', status: 'PRESENT', remarks: null },
      { date: '2025-05-02', status: 'PRESENT', remarks: null },
      { date: '2025-05-03', status: 'ABSENT', remarks: null }
    ] as AttendanceDayDto[]);
    expect(component.countStatus('PRESENT')).toBe(2);
    expect(component.countStatus('ABSENT')).toBe(1);
  });

  // ── API error handling ────────────────────────────────────────────────────

  it('loading is set to false even when getInbox errors', fakeAsync(() => {
    apiSvc.getInbox.and.returnValue(throwError(() => new Error('network')));
    component['loadInbox']();
    tick();
    expect(component.loading()).toBeFalse();
  }));
});
