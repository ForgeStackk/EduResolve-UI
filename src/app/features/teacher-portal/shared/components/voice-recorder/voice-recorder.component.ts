import {
  Component, OnDestroy, Output, EventEmitter, inject, signal, computed, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type RecorderState = 'IDLE' | 'RECORDING' | 'RECORDED';

@Component({
  selector: 'app-voice-recorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-recorder.component.html',
  styles: [`
    @keyframes waveBar {
      0%, 100% { height: 4px; }
      50%       { height: 22px; }
    }
    .wave-bar {
      display: inline-block;
      width: 4px;
      border-radius: 2px;
      background: #dc2626;
      animation: waveBar 0.65s ease-in-out infinite;
    }
  `]
})
export class VoiceRecorderComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @Output() voiceRecorded = new EventEmitter<Blob | null>();

  state        = signal<RecorderState>('IDLE');
  elapsed      = signal(0);
  audioUrl     = signal<string | null>(null);
  permError    = signal<string | null>(null);

  readonly MAX_SECONDS  = 300;
  readonly WARN_SECONDS = 240;
  /** Staggered animation delays (ms) for the 7 waveform bars. */
  readonly waveDelays   = [0, 120, 240, 80, 200, 40, 160];

  showCountdown = computed(() => this.state() === 'RECORDING' && this.elapsed() >= this.WARN_SECONDS);
  remaining     = computed(() => this.MAX_SECONDS - this.elapsed());

  private recorder?: MediaRecorder;
  private chunks:  Blob[]       = [];
  private stream?: MediaStream;
  private timer?:  ReturnType<typeof setInterval>;

  async startRecording(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.permError.set(null);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
        .find(m => MediaRecorder.isTypeSupported(m));

      this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);

      this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.recorder?.mimeType ?? 'audio/webm' });
        if (this.audioUrl()) URL.revokeObjectURL(this.audioUrl()!);
        this.audioUrl.set(URL.createObjectURL(blob));
        this.voiceRecorded.emit(blob);
        this.state.set('RECORDED');
        this.stopStream();
      };

      this.recorder.start(100);
      this.state.set('RECORDING');
      this.elapsed.set(0);

      this.timer = setInterval(() => {
        this.elapsed.update(s => {
          if (s + 1 >= this.MAX_SECONDS) this.stopRecording();
          return s + 1;
        });
      }, 1000);

    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      this.permError.set(
        name === 'NotAllowedError' || name === 'PermissionDeniedError'
          ? 'Microphone access is needed to record voice notes. Please allow access in your browser settings.'
          : 'Could not start recording. Check that your microphone is connected and try again.'
      );
    }
  }

  stopRecording(): void {
    clearInterval(this.timer);
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  deleteRecording(): void {
    if (this.audioUrl()) URL.revokeObjectURL(this.audioUrl()!);
    this.audioUrl.set(null);
    this.state.set('IDLE');
    this.voiceRecorded.emit(null);
  }

  formatTime(s: number): string {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = undefined;
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    if (this.recorder?.state === 'recording') this.recorder.stop();
    this.stopStream();
    if (this.audioUrl()) URL.revokeObjectURL(this.audioUrl()!);
  }
}
