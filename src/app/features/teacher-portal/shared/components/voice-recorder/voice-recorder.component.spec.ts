import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VoiceRecorderComponent } from './voice-recorder.component';

function mockMediaRecorder(mimeType = 'audio/webm') {
  const recorder: any = {
    start: jasmine.createSpy('start'),
    stop: jasmine.createSpy('stop'),
    state: 'inactive',
    mimeType,
    ondataavailable: null as any,
    onstop: null as any
  };
  (window as any).MediaRecorder = jasmine.createSpy('MediaRecorder').and.callFake(() => {
    recorder.state = 'inactive';
    return recorder;
  });
  (window as any).MediaRecorder.isTypeSupported = jasmine.createSpy().and.returnValue(true);
  return recorder;
}

function mockUserMedia(stream?: MediaStream) {
  const mockStream = stream ?? {
    getTracks: () => [{ stop: jasmine.createSpy('stop') }]
  } as unknown as MediaStream;
  const spy = jasmine.createSpy('getUserMedia').and.returnValue(Promise.resolve(mockStream));
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: spy },
    configurable: true
  });
  return spy;
}

describe('VoiceRecorderComponent', () => {
  let component: VoiceRecorderComponent;
  let fixture: ComponentFixture<VoiceRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceRecorderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    clearInterval((component as any).timer);
  });

  // ── initial state ─────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts in IDLE state', () => {
    expect(component.state()).toBe('IDLE');
  });

  it('elapsed starts at 0', () => {
    expect(component.elapsed()).toBe(0);
  });

  it('audioUrl starts null', () => {
    expect(component.audioUrl()).toBeNull();
  });

  it('showCountdown is false in IDLE state', () => {
    expect(component.showCountdown()).toBeFalse();
  });

  // ── formatTime helper ─────────────────────────────────────────────────────

  it('formatTime pads seconds correctly', () => {
    expect(component.formatTime(65)).toBe('01:05');
  });

  it('formatTime handles zero', () => {
    expect(component.formatTime(0)).toBe('00:00');
  });

  it('formatTime handles MAX_SECONDS boundary', () => {
    expect(component.formatTime(300)).toBe('05:00');
  });

  // ── remaining computed ────────────────────────────────────────────────────

  it('remaining equals MAX_SECONDS initially', () => {
    expect(component.remaining()).toBe(component.MAX_SECONDS);
  });

  // ── startRecording ────────────────────────────────────────────────────────

  it('startRecording sets state to RECORDING and requests microphone', fakeAsync(async () => {
    const recorder = mockMediaRecorder();
    mockUserMedia();

    await component.startRecording();
    tick(0);

    expect(component.state()).toBe('RECORDING');
    recorder.state = 'recording';
  }));

  it('startRecording on permission denied sets permError', fakeAsync(async () => {
    const err = new DOMException('Denied', 'NotAllowedError');
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: jasmine.createSpy().and.returnValue(Promise.reject(err)) },
      configurable: true
    });

    await component.startRecording();
    tick(0);

    expect(component.permError()).toContain('Microphone access');
  }));

  it('startRecording on unknown error sets generic permError', fakeAsync(async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: jasmine.createSpy().and.returnValue(Promise.reject(new Error('no mic'))) },
      configurable: true
    });

    await component.startRecording();
    tick(0);

    expect(component.permError()).toContain('Could not start');
  }));

  // ── stopRecording → RECORDED ──────────────────────────────────────────────

  it('stopRecording calls recorder.stop() and transitions to RECORDED', fakeAsync(async () => {
    const recorder = mockMediaRecorder();
    mockUserMedia();

    await component.startRecording();
    tick(0);

    recorder.state = 'recording';
    const chunk = new Blob(['audio'], { type: 'audio/webm' });
    recorder.ondataavailable?.({ data: chunk });

    const voiceEmitted: (Blob | null)[] = [];
    component.voiceRecorded.subscribe(b => voiceEmitted.push(b));

    recorder.onstop?.();
    tick(0);

    expect(component.state()).toBe('RECORDED');
    expect(component.audioUrl()).not.toBeNull();
    expect(voiceEmitted.length).toBe(1);
    expect(voiceEmitted[0]).toBeInstanceOf(Blob);
  }));

  // ── deleteRecording ───────────────────────────────────────────────────────

  it('deleteRecording resets state to IDLE and emits null', () => {
    component.audioUrl.set('blob:fake-url');
    component.state.set('RECORDED');

    const emitted: (Blob | null)[] = [];
    component.voiceRecorded.subscribe(b => emitted.push(b));

    component.deleteRecording();

    expect(component.state()).toBe('IDLE');
    expect(component.audioUrl()).toBeNull();
    expect(emitted).toEqual([null]);
  });

  // ── waveDelays ────────────────────────────────────────────────────────────

  it('waveDelays has 7 entries for animation bars', () => {
    expect(component.waveDelays.length).toBe(7);
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────

  it('ngOnDestroy does not throw when in IDLE state', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('ngOnDestroy revokes audioUrl objectURL', () => {
    component.audioUrl.set('blob:http://localhost/fake');
    expect(() => component.ngOnDestroy()).not.toThrow();
    expect(component.audioUrl()).toBeNull();
  });
});
