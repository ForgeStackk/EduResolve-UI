import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import {
  StudentDocumentApiService,
  StudentDocument
} from '../../../core/api/student-document-api.service';

@Component({
  selector: 'app-my-documents',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './my-documents.component.html',
  styleUrl: './my-documents.component.css'
})
export class MyDocumentsComponent implements OnInit {
  private auth   = inject(AuthService);
  private docApi = inject(StudentDocumentApiService);
  private router = inject(Router);

  docs        = signal<StudentDocument[]>([]);
  loading     = signal(false);
  uploading   = signal(false);
  error       = signal('');
  uploadError = signal('');
  dragOver    = signal(false);

  private get studentId(): number {
    return this.auth.currentUser()?.studentId ?? 0;
  }

  ngOnInit(): void {
    this.loadDocs();
  }

  loadDocs(): void {
    if (!this.studentId) return;
    this.loading.set(true);
    this.docApi.listByStudent(this.studentId).subscribe({
      next: docs => { this.docs.set(docs); this.loading.set(false); },
      error: ()  => { this.error.set('myDocs.loadError'); this.loading.set(false); }
    });
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  private uploadFile(file: File): void {
    this.uploadError.set('');
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.uploadError.set('myDocs.pdfOnly');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.uploadError.set('myDocs.fileTooLarge');
      return;
    }
    this.uploading.set(true);
    this.docApi.upload(file, this.studentId).subscribe({
      next: doc => {
        this.docs.update(list => [doc, ...list]);
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('myDocs.uploadFailed');
        this.uploading.set(false);
      }
    });
  }

  openDoc(doc: StudentDocument): void {
    const pdfUrl = this.docApi.getContentUrl(doc.id);
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: { pdfPath: pdfUrl, title: doc.originalName }
    });
  }

  deleteDoc(doc: StudentDocument, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Delete "' + doc.originalName + '"?')) return;
    this.docApi.delete(doc.id, this.studentId).subscribe({
      next: () => this.docs.update(list => list.filter(d => d.id !== doc.id)),
      error: () => this.error.set('myDocs.deleteFailed')
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
