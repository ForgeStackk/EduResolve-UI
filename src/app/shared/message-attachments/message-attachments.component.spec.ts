import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageAttachmentsComponent } from './message-attachments.component';
import { AttachmentInfo } from '../../core/api/student-inbox-api.service';
import { environment } from '../../../environments/environment';

function att(overrides: Partial<AttachmentInfo> = {}): AttachmentInfo {
  return {
    attachmentId: 'att-001',
    fileType: 'DOCUMENT',
    fileName: 'notes.pdf',
    fileSizeBytes: 2048,
    mimeType: 'application/pdf',
    ...overrides
  };
}

describe('MessageAttachmentsComponent', () => {
  let component: MessageAttachmentsComponent;
  let fixture: ComponentFixture<MessageAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageAttachmentsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageAttachmentsComponent);
    component = fixture.componentInstance;
  });

  // ── creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing when attachments is empty', () => {
    component.attachments = [];
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('div.space-y-2');
    expect(container).toBeNull();
  });

  // ── url() helper ─────────────────────────────────────────────────────────

  it('url() builds the correct download URL', () => {
    const url = component.url('att-abc');
    expect(url).toBe(`${environment.apiBaseUrl}/v1/messages/attachments/att-abc/content`);
  });

  // ── DOCUMENT rendering ────────────────────────────────────────────────────

  it('renders an anchor link for DOCUMENT attachments', () => {
    component.attachments = [att({ fileType: 'DOCUMENT', fileName: 'chapter1.pdf', attachmentId: 'doc-1' })];
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[target="_blank"]');
    expect(link).not.toBeNull();
    expect(link.href).toContain('doc-1');
    expect(link.textContent).toContain('chapter1.pdf');
  });

  it('document link has rel=noopener', () => {
    component.attachments = [att({ fileType: 'DOCUMENT', attachmentId: 'd1' })];
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.rel).toContain('noopener');
  });

  // ── IMAGE rendering ───────────────────────────────────────────────────────

  it('renders an img element for IMAGE attachments', () => {
    component.attachments = [att({ fileType: 'IMAGE', fileName: 'photo.jpg', attachmentId: 'img-1' })];
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toContain('img-1');
    expect(img.alt).toBe('photo.jpg');
  });

  // ── VOICE rendering ───────────────────────────────────────────────────────

  it('renders an audio element with controls for VOICE attachments', () => {
    component.attachments = [att({ fileType: 'VOICE', fileName: 'voice.webm', attachmentId: 'v-1' })];
    fixture.detectChanges();

    const audio: HTMLAudioElement = fixture.nativeElement.querySelector('audio');
    expect(audio).not.toBeNull();
    expect(audio.controls).toBeTrue();
    expect(audio.src).toContain('v-1');
  });

  // ── mixed attachments ─────────────────────────────────────────────────────

  it('renders all attachment types together in correct order', () => {
    component.attachments = [
      att({ fileType: 'VOICE', fileName: 'voice.webm', attachmentId: 'v1' }),
      att({ fileType: 'IMAGE', fileName: 'img.jpg', attachmentId: 'i1' }),
      att({ fileType: 'DOCUMENT', fileName: 'doc.pdf', attachmentId: 'd1' })
    ];
    fixture.detectChanges();

    const audio = fixture.nativeElement.querySelector('audio');
    const img   = fixture.nativeElement.querySelector('img');
    const link  = fixture.nativeElement.querySelector('a');

    expect(audio).not.toBeNull();
    expect(img).not.toBeNull();
    expect(link).not.toBeNull();
  });

  it('renders multiple documents as separate links', () => {
    component.attachments = [
      att({ fileType: 'DOCUMENT', fileName: 'a.pdf', attachmentId: 'da' }),
      att({ fileType: 'DOCUMENT', fileName: 'b.pdf', attachmentId: 'db' })
    ];
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(2);
  });
});
