import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NcertBook {
  id: number;
  classGrade: string;
  subject: string;
  title: string;
  githubUrl: string;
  githubRepo: string;
  githubPath: string;
  pdfFilename: string;
  totalPages: number;
  uploadedAt: string;
  updatedAt: string;
}

export interface NcertChapter {
  id: number;
  bookId: number;
  title: string;
  chapterNumber: number;
  orderIndex: number;
  summary: string;
  startPage: number;
  endPage: number;
}

export interface ContentBlock {
  id: number;
  chapterId: number;
  blockType: 'TEXT' | 'IMAGE' | 'DIAGRAM' | 'TABLE' | 'HEADING';
  contentText: string;
  imageUrl: string;
  imageFilename: string;
  orderIndex: number;
  heading: string;
  pageNumber: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface QuestionRequest {
  classLevel: number;
  question: string;
  subject: string;
  context?: string;
}

export interface QuestionResponse {
  answer: string;
}

export interface QuizRequest {
  difficulty: string;
  count: number;
  maxChapterId: number;
  classLevel: number;
}

export interface VisualizationData {
  concept: string;
  type: string;
  content: string;
  description: string;
}

export interface BookUploadRequest {
  classGrade: string;
  subject: string;
  title: string;
  localPath: string;
}

/**
 * Comprehensive service for NCERT Learning Platform API
 */
@Injectable({
  providedIn: 'root'
})
export class NcertLearningService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  constructor() {}

  /**
   * Get list of available classes
   */
  getClasses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/classes`).pipe(
      catchError(() => of(['Class 9', 'Class 10', 'Class 11', 'Class 12']))
    );
  }

  /**
   * Get subjects for a specific class
   */
  getSubjectsByClass(classId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/classes/${classId}/subjects`).pipe(
      catchError(() => of(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography']))
    );
  }

  /**
   * Get books for a specific subject
   */
  getBooksBySubject(subjectId: string): Observable<NcertBook[]> {
    return this.http.get<NcertBook[]>(`${this.baseUrl}/subjects/${subjectId}/books`).pipe(
      catchError(() => of(this.getMockBooks()))
    );
  }

  /**
   * Get books for class and subject
   */
  getBooks(classGrade: string, subject: string): Observable<NcertBook[]> {
    const params = new HttpParams()
      .set('classGrade', classGrade)
      .set('subject', subject);
    
    return this.http.get<NcertBook[]>(`${this.baseUrl}/api/books`, { params }).pipe(
      catchError(() => of(this.getMockBooks().filter(book => 
        book.classGrade === classGrade && book.subject === subject
      )))
    );
  }

  /**
   * Get chapters for a specific book
   */
  getChaptersByBook(bookId: number): Observable<NcertChapter[]> {
    return this.http.get<NcertChapter[]>(`${this.baseUrl}/books/${bookId}/chapters`).pipe(
      catchError(() => of(this.getMockChapters(bookId)))
    );
  }

  /**
   * Get PDF URL for a specific book
   */
  getBookPdfUrl(bookId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/books/${bookId}/pdf`).pipe(
      catchError(() => of({ url: 'https://github.com/sample/pdf.pdf' }))
    );
  }

  /**
   * Get content blocks for a specific chapter
   */
  getChapterContent(chapterId: number): Observable<ContentBlock[]> {
    return this.http.get<ContentBlock[]>(`${this.baseUrl}/chapters/${chapterId}/content`).pipe(
      catchError(() => of(this.getMockContentBlocks(chapterId)))
    );
  }

  /**
   * Upload new NCERT PDF to GitHub repository
   */
  uploadPdf(request: BookUploadRequest): Observable<{ message: string; bookId: string }> {
    return this.http.post<{ message: string; bookId: string }>(`${this.baseUrl}/books/upload`, request).pipe(
      catchError(() => of({ message: 'Upload simulated successfully', bookId: '123' }))
    );
  }

  /**
   * Generate quiz based on parameters
   */
  generateQuiz(request: QuizRequest): Observable<QuizQuestion[]> {
    return this.http.post<QuizQuestion[]>(`${this.baseUrl}/quiz/generate`, request).pipe(
      catchError(() => of(this.getMockQuizQuestions(request.count)))
    );
  }

  /**
   * AI Q&A endpoint
   */
  askQuestion(request: QuestionRequest): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(`${this.baseUrl}/ask`, request).pipe(
      catchError(() => of({ 
        answer: `This is a mock answer for your question: "${request.question}" for Class ${request.classLevel} ${request.subject}. In a real implementation, this would be generated by ChatGPT.`
      }))
    );
  }

  /**
   * Get 3D visualization data for a concept
   */
  getVisualization(conceptId: string, classLevel: number, subject: string): Observable<VisualizationData> {
    const params = new HttpParams()
      .set('classLevel', classLevel.toString())
      .set('subject', subject);
    
    return this.http.get<VisualizationData>(`${this.baseUrl}/concepts/${conceptId}/visual`, { params }).pipe(
      catchError(() => of(this.getMockVisualizationData(conceptId)))
    );
  }

  // Mock data methods for fallback
  private getMockBooks(): NcertBook[] {
    return [
      {
        id: 1,
        classGrade: 'Class 9',
        subject: 'Mathematics',
        title: 'Mathematics - Class 9',
        githubUrl: 'https://github.com/ncert/class9-maths.pdf',
        githubRepo: 'ncert/content',
        githubPath: 'Class 9/Mathematics/Mathematics-Class-9.pdf',
        pdfFilename: 'Mathematics-Class-9.pdf',
        totalPages: 320,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        classGrade: 'Class 9',
        subject: 'Science',
        title: 'Science - Class 9',
        githubUrl: 'https://github.com/ncert/class9-science.pdf',
        githubRepo: 'ncert/content',
        githubPath: 'Class 9/Science/Science-Class-9.pdf',
        pdfFilename: 'Science-Class-9.pdf',
        totalPages: 280,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getMockChapters(bookId: number): NcertChapter[] {
    const chapters: NcertChapter[] = [];
    for (let i = 1; i <= 10; i++) {
      chapters.push({
        id: bookId * 100 + i,
        bookId,
        title: `Chapter ${i}: Sample Chapter Title`,
        chapterNumber: i,
        orderIndex: i,
        summary: `This is a summary of Chapter ${i} covering important concepts and topics.`,
        startPage: (i - 1) * 25 + 1,
        endPage: i * 25
      });
    }
    return chapters;
  }

  private getMockContentBlocks(chapterId: number): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    let orderIndex = 1;

    // Add heading
    blocks.push({
      id: chapterId * 1000 + orderIndex,
      chapterId,
      blockType: 'HEADING',
      contentText: 'Introduction to the Chapter',
      imageUrl: '',
      imageFilename: '',
      orderIndex: orderIndex++,
      heading: 'Introduction',
      pageNumber: 1
    });

    // Add text content
    blocks.push({
      id: chapterId * 1000 + orderIndex,
      chapterId,
      blockType: 'TEXT',
      contentText: 'This is the main content of the chapter. It contains detailed explanations, examples, and important concepts that students need to understand. The content is structured to facilitate learning and comprehension.',
      imageUrl: '',
      imageFilename: '',
      orderIndex: orderIndex++,
      heading: '',
      pageNumber: 1
    });

    // Add image placeholder
    blocks.push({
      id: chapterId * 1000 + orderIndex,
      chapterId,
      blockType: 'IMAGE',
      contentText: 'Figure 1.1: Diagram showing the concept',
      imageUrl: 'https://via.placeholder.com/400x300',
      imageFilename: 'figure1-1.png',
      orderIndex: orderIndex++,
      heading: 'Figure 1.1',
      pageNumber: 2
    });

    return blocks;
  }

  private getMockQuizQuestions(count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        question: `Sample question ${i}: What is the main concept discussed in this chapter?`,
        options: [
          'Option A: First possible answer',
          'Option B: Second possible answer',
          'Option C: Third possible answer',
          'Option D: Fourth possible answer'
        ],
        correct: 'A',
        explanation: `This is the explanation for question ${i}. It explains why option A is correct and why other options are incorrect.`
      });
    }
    return questions;
  }

  private getMockVisualizationData(concept: string): VisualizationData {
    return {
      concept,
      type: '3d',
      content: JSON.stringify({
        geometry: 'sphere',
        radius: 1,
        position: { x: 0, y: 0, z: 0 },
        color: 0x00ff00,
        animation: 'rotation'
      }),
      description: `3D visualization of ${concept} concept for better understanding`
    };
  }
}
