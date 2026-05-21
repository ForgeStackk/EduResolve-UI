import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageComposerComponent } from './message-composer.component';
import { MessagesService } from '../../../messages/messages.service';
import { HomeworkService } from '../../../homework/homework.service';
import { SendMessageResponse } from '../../models/teacher-portal.models';

const MOCK_RESPONSE: SendMessageResponse = {
  messageId: 'msg-001',
  sentAt: new Date().toISOString(),
  deliveredTo: 4
};

function makeFile(name: string, type = 'application/pdf', sizeBytes = 1024): File {
  return new File(['x'.repeat(sizeBytes)], name, { type });
}

describe('MessageComposerComponent', () => {
  let component: MessageComposerComponent;
  let fixture: ComponentFixture<MessageComposerComponent>;
  let msgSvc: jasmine.SpyObj<MessagesService>;
  let hwSvc: jasmine.SpyObj<HomeworkService>;

  beforeEach(async () => {
    msgSvc = jasmine.createSpyObj('MessagesService', ['send']);
    hwSvc  = jasmine.createSpyObj('HomeworkService',  ['send']);
    msgSvc.send.and.returnValue(of(MOCK_RESPONSE));
    hwSvc.send.and.returnValue(of(MOCK_RESPONSE));

    await TestBed.configureTestingModule({
      imports: [MessageComposerComponent],
      providers: [
        { provide: MessagesService, useValue: msgSvc },
        { provide: HomeworkService,  useValue: hwSvc  }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageComposerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('classId', 'class-abc');
    fixture.detectChanges();
  });

  // ── creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hasContent is false when all fields are empty', () => {
    expect(component.hasContent()).toBeFalse();
  });

  it('Send button is disabled when composer is empty', () => {
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="button"]');
    expect(btn.disabled).toBeTrue();
  });

  // ── text body ─────────────────────────────────────────────────────────────

  it('hasContent becomes true after entering text', () => {
    component.textBody.set('Hello class!');
    expect(component.hasContent()).toBeTrue();
  });

  it('hasContent is false for whitespace-only text', () => {
    component.textBody.set('   ');
    expect(component.hasContent()).toBeFalse();
  });

  // ── voice note ────────────────────────────────────────────────────────────

  it('onVoiceRecorded stores the blob and makes hasContent true', () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    component.onVoiceRecorded(blob);
    expect(component.voiceBlob()).toBe(blob);
    expect(component.hasContent()).toBeTrue();
  });

  it('onVoiceRecorded with null clears voice state', () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    component.onVoiceRecorded(blob);
    component.onVoiceRecorded(null);
    expect(component.voiceBlob()).toBeNull();
  });

  // ── image management ──────────────────────────────────────────────────────

  it('valid image under 5 MB is added to images and imagePreviews', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 500);
    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.addImages(event);

    expect(component.images().length).toBe(1);
    expect(component.imagePreviews().length).toBe(1);
    expect(component.hasContent()).toBeTrue();
  });

  it('non-image file is rejected with an error message', () => {
    const file = makeFile('doc.pdf', 'application/pdf', 500);
    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.addImages(event);

    expect(component.images().length).toBe(0);
    expect(component.error()).toContain('not an image');
  });

  it('image over 5 MB is rejected with an error message', () => {
    const bigFile = makeFile('huge.jpg', 'image/jpeg', 6 * 1024 * 1024);
    const event = { target: { files: [bigFile], value: '' } } as unknown as Event;
    component.addImages(event);

    expect(component.images().length).toBe(0);
    expect(component.error()).toContain('5 MB');
  });

  it('removeImage removes entry from images and imagePreviews', () => {
    const file = makeFile('snap.jpg', 'image/jpeg', 100);
    component.addImages({ target: { files: [file], value: '' } } as unknown as Event);
    expect(component.images().length).toBe(1);

    component.removeImage(0);

    expect(component.images().length).toBe(0);
    expect(component.imagePreviews().length).toBe(0);
  });

  it('lightbox opens and closes correctly', () => {
    component.openLightbox('blob:http://localhost/1');
    expect(component.lightboxUrl()).toBe('blob:http://localhost/1');

    component.closeLightbox();
    expect(component.lightboxUrl()).toBeNull();
  });

  // ── file management ───────────────────────────────────────────────────────

  it('valid file under 25 MB is added to files list', () => {
    const file = makeFile('notes.pdf', 'application/pdf', 1024);
    component.addFiles({ target: { files: [file], value: '' } } as unknown as Event);

    expect(component.files().length).toBe(1);
    expect(component.hasContent()).toBeTrue();
  });

  it('file over 25 MB is rejected with an error message', () => {
    const bigFile = makeFile('huge.zip', 'application/zip', 26 * 1024 * 1024);
    component.addFiles({ target: { files: [bigFile], value: '' } } as unknown as Event);

    expect(component.files().length).toBe(0);
    expect(component.error()).toContain('25 MB');
  });

  it('filesAtLimit becomes true at maxFiles cap', () => {
    for (let i = 0; i < component.maxFiles; i++) {
      component.files.update(f => [...f, makeFile(`f${i}.pdf`)]);
    }
    expect(component.filesAtLimit()).toBeTrue();
  });

  it('removeFile removes entry by index', () => {
    component.addFiles({ target: { files: [makeFile('a.pdf'), makeFile('b.pdf')], value: '' } } as unknown as Event);
    component.removeFile(0);
    expect(component.files().length).toBe(1);
    expect(component.files()[0].name).toBe('b.pdf');
  });

  // ── drag-and-drop ─────────────────────────────────────────────────────────

  it('onImageDrop ingests dropped image files', () => {
    const file = makeFile('dropped.jpg', 'image/jpeg', 200);
    const event = {
      preventDefault: jasmine.createSpy(),
      dataTransfer: { files: [file] }
    } as unknown as DragEvent;
    component.onImageDrop(event);

    expect(component.images().length).toBe(1);
  });

  // ── send — success ────────────────────────────────────────────────────────

  it('send() calls MessagesService.send with FormData and emits messageSent', fakeAsync(() => {
    component.textBody.set('Test message');
    const emitted: SendMessageResponse[] = [];
    component.messageSent.subscribe(r => emitted.push(r));

    component.send();
    tick(100);

    expect(msgSvc.send).toHaveBeenCalledTimes(1);
    const fd: FormData = msgSvc.send.calls.mostRecent().args[0];
    expect(fd.get('textBody')).toBe('Test message');
    expect(emitted.length).toBe(1);
    expect(emitted[0].deliveredTo).toBe(4);
  }));

  it('send() includes voiceNote in FormData when a blob is present', fakeAsync(() => {
    component.textBody.set('With voice');
    component.voiceBlob.set(new Blob(['audio'], { type: 'audio/webm' }));

    component.send();
    tick(100);

    const fd: FormData = msgSvc.send.calls.mostRecent().args[0];
    expect(fd.get('voiceNote')).not.toBeNull();
  }));

  it('send() resets form after success', fakeAsync(() => {
    component.textBody.set('Hai');
    component.send();
    tick(100);

    expect(component.textBody()).toBe('');
    expect(component.voiceBlob()).toBeNull();
    expect(component.images().length).toBe(0);
  }));

  it('send() sets sent signal with delivered count', fakeAsync(() => {
    component.textBody.set('OK');
    component.send();
    tick(100);

    expect(component.sent()).toBe(4);
  }));

  // ── send — homework path ──────────────────────────────────────────────────

  it('send() uses HomeworkService when showDueDatePicker is true', fakeAsync(() => {
    fixture.componentRef.setInput('showDueDatePicker', true);
    component.textBody.set('Chapter 3 exercises');
    component.dueDate.set('2026-06-15');

    component.send();
    tick(100);

    expect(hwSvc.send).toHaveBeenCalled();
    expect(msgSvc.send).not.toHaveBeenCalled();
  }));

  it('send() sets error if due date is missing when showDueDatePicker is true', () => {
    fixture.componentRef.setInput('showDueDatePicker', true);
    component.textBody.set('Homework');
    component.dueDate.set('');

    component.send();

    expect(component.error()).toContain('due date');
    expect(msgSvc.send).not.toHaveBeenCalled();
  });

  // ── send — error ──────────────────────────────────────────────────────────

  it('send() sets error message on service failure', fakeAsync(() => {
    msgSvc.send.and.returnValue(throwError(() => new Error('500 Internal Server Error')));
    component.textBody.set('Bad message');

    component.send();
    tick(5000); // account for retry back-off

    expect(component.error()).toContain('Failed to send');
    expect(component.sending()).toBeFalse();
  }));

  it('send() preserves attachment files on failure so teacher can retry', fakeAsync(() => {
    msgSvc.send.and.returnValue(throwError(() => new Error('Network error')));
    component.addFiles({ target: { files: [makeFile('important.pdf')], value: '' } } as unknown as Event);
    component.textBody.set('Retry test');

    component.send();
    tick(5000);

    expect(component.files().length).toBe(1);
  }));

  // ── formatBytes helper ────────────────────────────────────────────────────

  it('formatBytes formats KB correctly', () => {
    expect(component.formatBytes(512)).toBe('1 KB');
  });

  it('formatBytes formats MB correctly', () => {
    expect(component.formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────

  it('ngOnDestroy revokes preview URLs without throwing', () => {
    component.addImages({ target: { files: [makeFile('x.jpg', 'image/jpeg', 100)], value: '' } } as unknown as Event);
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
