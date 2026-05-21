import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  StudentInboxApiService,
  StudentInboxItem,
  AttendanceDayDto
} from './student-inbox-api.service';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/v1/student-portal`;

describe('StudentInboxApiService', () => {
  let service: StudentInboxApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentInboxApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service  = TestBed.inject(StudentInboxApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getInbox ──────────────────────────────────────────────────────────────

  it('getInbox() GETs /inbox with default pagination', () => {
    service.getInbox().subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/inbox`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('50');
    req.flush([]);
  });

  it('getInbox() returns deserialized StudentInboxItem list', () => {
    const items: StudentInboxItem[] = [{
      inboxId: 'i1', messageId: 'm1', senderName: 'Ms. Priya',
      category: 'CLASS_NOTICE', targetSubjectId: null, subjectName: null,
      textBody: 'Hi class', contentType: 'TEXT',
      sentAt: new Date().toISOString(), isHomework: false,
      homeworkDueDate: null, readStatus: 'UNREAD', attachments: []
    }];

    let result: StudentInboxItem[] = [];
    service.getInbox().subscribe(r => (result = r));

    httpMock.expectOne(r => r.url === `${BASE}/inbox`).flush(items);
    expect(result.length).toBe(1);
    expect(result[0].senderName).toBe('Ms. Priya');
  });

  // ── markRead ──────────────────────────────────────────────────────────────

  it('markRead() sends PATCH to correct URL', () => {
    service.markRead('inbox-xyz').subscribe();
    const req = httpMock.expectOne(`${BASE}/inbox/inbox-xyz/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  // ── getUnreadCount ────────────────────────────────────────────────────────

  it('getUnreadCount() GETs /inbox/unread-count', () => {
    let count = -1;
    service.getUnreadCount().subscribe(r => (count = r.count));

    const req = httpMock.expectOne(`${BASE}/inbox/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 5 });

    expect(count).toBe(5);
  });

  // ── getAttendance ─────────────────────────────────────────────────────────

  it('getAttendance() GETs /attendance with month and year params', () => {
    service.getAttendance(5, 2025).subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/attendance`);
    expect(req.request.params.get('month')).toBe('5');
    expect(req.request.params.get('year')).toBe('2025');
    req.flush([]);
  });

  it('getAttendance() returns deserialized AttendanceDayDto list', () => {
    const days: AttendanceDayDto[] = [
      { date: '2025-05-01', status: 'PRESENT', remarks: null },
      { date: '2025-05-02', status: 'ABSENT', remarks: 'sick' }
    ];

    let result: AttendanceDayDto[] = [];
    service.getAttendance(5, 2025).subscribe(r => (result = r));

    httpMock.expectOne(r => r.url === `${BASE}/attendance`).flush(days);
    expect(result.length).toBe(2);
    expect(result[1].remarks).toBe('sick');
  });
});
