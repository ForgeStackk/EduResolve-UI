import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { NcertLearningService, QuestionRequest, QuestionResponse } from '../../../core/api/ncert-learning.service';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  classLevel?: number;
  subject?: string;
  isTyping?: boolean;
}

export interface SuggestedQuestion {
  text: string;
  category: string;
  classLevel: number;
}

@Component({
  selector: 'app-ai-qa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './ai-qa.component.html',
  styleUrls: ['./ai-qa.component.css']
})
export class AiQaComponent implements OnInit {
  private ncertService = inject(NcertLearningService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Form data
  selectedClass = 9;
  selectedSubject = 'Mathematics';
  question = '';
  context = '';

  // Chat data
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  // Available options
  classes = [9, 10, 11, 12];
  subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Science'];

  // Suggested questions
  suggestedQuestions = signal<SuggestedQuestion[]>([]);

  ngOnInit(): void {
    this.loadSuggestedQuestions();
    this.initializeFromQueryParams();
    
    // Add welcome message
    this.addMessage({
      id: 'welcome',
      type: 'ai',
      content: `Hello! I'm your AI learning assistant. I can help you understand NCERT concepts, answer your questions, and provide explanations tailored to your class level. Feel free to ask me anything!`,
      timestamp: new Date()
    });
  }

  initializeFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['classGrade']) {
        const classMatch = params['classGrade'].match(/\d+/);
        if (classMatch) {
          this.selectedClass = parseInt(classMatch[0]);
        }
      }
      if (params['subject']) {
        this.selectedSubject = params['subject'];
      }
      if (params['bookTitle']) {
        this.context = `Currently studying: ${params['bookTitle']}`;
      }
    });
  }

  loadSuggestedQuestions(): void {
    const questions: SuggestedQuestion[] = [
      {
        text: 'What are the basic concepts of algebra?',
        category: 'Mathematics',
        classLevel: 9
      },
      {
        text: 'Explain the laws of motion with examples',
        category: 'Physics',
        classLevel: 10
      },
      {
        text: 'How do plants perform photosynthesis?',
        category: 'Biology',
        classLevel: 10
      },
      {
        text: 'What are the different types of chemical reactions?',
        category: 'Chemistry',
        classLevel: 11
      },
      {
        text: 'Explain the concept of democracy',
        category: 'History',
        classLevel: 9
      },
      {
        text: 'How do we calculate probability?',
        category: 'Mathematics',
        classLevel: 11
      }
    ];
    
    this.suggestedQuestions.set(questions.filter(q => q.classLevel <= this.selectedClass));
  }

  askQuestion(): void {
    const questionText = this.question.trim();
    if (!questionText) {
      this.snackBar.open('Please enter a question', 'Close', { duration: 3000 });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: questionText,
      timestamp: new Date(),
      classLevel: this.selectedClass,
      subject: this.selectedSubject
    };

    this.addMessage(userMessage);
    this.question = '';

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing-' + Date.now(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    this.addMessage(typingMessage);

    // Make API call
    this.isLoading.set(true);
    const request: QuestionRequest = {
      classLevel: this.selectedClass,
      question: questionText,
      subject: this.selectedSubject,
      context: this.context
    };

    this.ncertService.askQuestion(request).subscribe({
      next: (response) => {
        // Remove typing indicator
        this.removeMessage(typingMessage.id);
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          type: 'ai',
          content: response.answer,
          timestamp: new Date(),
          classLevel: this.selectedClass,
          subject: this.selectedSubject
        };
        
        this.addMessage(aiMessage);
        this.isLoading.set(false);
      },
      error: (error) => {
        // Remove typing indicator
        this.removeMessage(typingMessage.id);
        
        // Add error message
        const errorMessage: ChatMessage = {
          id: 'error-' + Date.now(),
          type: 'ai',
          content: 'I apologize, but I encountered an error while processing your question. Please try again later or rephrase your question.',
          timestamp: new Date()
        };
        
        this.addMessage(errorMessage);
        this.isLoading.set(false);
        this.snackBar.open('Failed to get AI response', 'Close', { duration: 3000 });
      }
    });
  }

  useSuggestedQuestion(suggestedQuestion: SuggestedQuestion): void {
    this.question = suggestedQuestion.text;
    if (suggestedQuestion.category) {
      this.selectedSubject = suggestedQuestion.category;
    }
    if (suggestedQuestion.classLevel) {
      this.selectedClass = suggestedQuestion.classLevel;
    }
  }

  clearChat(): void {
    this.messages.set([]);
    this.addMessage({
      id: 'welcome-' + Date.now(),
      type: 'ai',
      content: `Chat cleared! How can I help you with Class ${this.selectedClass} ${this.selectedSubject} today?`,
      timestamp: new Date()
    });
  }

  exportChat(): void {
    const chatContent = this.messages()
      .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.type.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ncert-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.snackBar.open('Chat exported successfully', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/learn/book-browser']);
  }

  // Helper methods
  private addMessage(message: ChatMessage): void {
    this.messages.update(messages => [...messages, message]);
  }

  private removeMessage(messageId: string): void {
    this.messages.update(messages => messages.filter(msg => msg.id !== messageId));
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getClassLabel(classLevel: number): string {
    return `Class ${classLevel}`;
  }

  onClassChange(): void {
    this.loadSuggestedQuestions();
  }

  // Keyboard shortcuts
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const element = document.getElementById('chat-messages');
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  // Track changes for auto-scroll
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
}
