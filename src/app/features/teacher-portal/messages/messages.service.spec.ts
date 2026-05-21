import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessagesService } from './messages.service';
import { SendMessageResponse, MessageSummary, PagedResponse } from '../shared/models/teacher-portal.models';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/v1/teacher-portal`;

describe('MessagesService', () => {
  let service: MessagesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MessagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── send ──────────────────────────────────────────────────────────────────

  it('send() POSTs FormData to the correct endpoint', () => {
    const resp: SendMessageResponse = { messageId: 'm1', sentAt: new Date().toISOString(), deliveredTo: 3 };
    const fd = new FormData();
    fd.append('textBody', 'Hello');

    service.send(fd).subscribe(r => {
      expect(r.deliveredTo).toBe(3);
    });

    const req = httpMock.expectOne(`${BASE}/messages/send`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(fd);
    req.flush(resp);
  });

  it('send() propagates HTTP errors to the caller', () => {
    const fd = new FormData();
    let errorCaught = false;

    service.send(fd).subscribe({
      error: () => { errorCaught = true; }
    });

    httpMock.expectOne(`${BASE}/messages/send`).flush('Server error', {
      status: 500, statusText: 'Internal Server Error'
    });

    expect(errorCaught).toBeTrue();
  });

  // ── getSent ───────────────────────────────────────────────────────────────

  it('getSent() GETs the correct endpoint with pagination params', () => {
    const pagedResp: PagedResponse<MessageSummary> = {
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20
    };

    service.getSent(undefined, 0, 20).subscribe();

    const req = httpMock.expectOne(r => r.url === `${BASE}/messages/sent`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(pagedResp);
  });

  it('getSent() appends classId param when provided', () => {
    service.getSent('class-xyz', 1, 10).subscribe();

    const req = httpMock.expectOne(r => r.url === `${BASE}/messages/sent`);
    expect(req.request.params.get('classId')).toBe('class-xyz');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 1, size: 10 });
  });

  it('getSent() does not append classId param when undefined', () => {
    service.getSent(undefined, 0, 5).subscribe();

    const req = httpMock.expectOne(r => r.url === `${BASE}/messages/sent`);
    expect(req.request.params.has('classId')).toBeFalse();
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 5 });
  });
});
