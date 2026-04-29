import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voice-messaging',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 font-sans">
      <div class="mb-5 border-b border-gray-100 pb-3">
        <h3 class="text-xl font-bold text-brand-black">Voice Announcements</h3>
        <p class="text-sm text-gray-500 mt-1">Record quick audio clips for your class.</p>
      </div>

      <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        @if (!isRecording()) {
          <button (click)="startRecording()" class="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-sm">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div> Record
          </button>
        } @else {
          <button (click)="stopRecording()" class="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors shadow-sm animate-pulse">
            <div class="w-2.5 h-2.5 bg-red-500 rounded-sm"></div> Stop Recording...
          </button>
        }

        @if (audioUrl()) {
          <div class="flex items-center gap-3 ml-auto border-l border-gray-200 pl-4">
            <span class="text-sm font-semibold text-gray-500">Preview:</span>
            <audio [src]="audioUrl()" controls class="h-10 w-64 outline-none rounded-full"></audio>
          </div>
        }
      </div>
    </div>
  `
})
export class VoiceMessagingComponent {
  isRecording = signal(false);
  audioUrl = signal<string | null>(null);
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl.set(URL.createObjectURL(audioBlob));
      };
      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.audioUrl.set(null); // Reset previous recording
    } catch (err) { console.error('Microphone access denied:', err); }
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());
    this.isRecording.set(false);
  }
}