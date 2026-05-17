import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

interface LeaderboardEntry {
  studentId: number;
  studentName: string;
  avatar: string;
  currentStreak: number;
  missionsCompleted: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  @Input() classGrade!: string;
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  
  leaderboard = signal<LeaderboardEntry[]>([]);
  currentStudentId = signal<number | null>(this.auth.currentUser()?.studentId || null);

  ngOnInit() {
    this.http.get<LeaderboardEntry[]>(`${environment.apiBaseUrl}/leaderboard?classGrade=${this.classGrade || '9'}`)
      .subscribe(data => this.leaderboard.set(data));
  }

  getTitle(index: number): string {
    const titles = ['Concept Master', 'Knowledge Explorer', 'Rising Star', 'Avid Learner', 'Dedicated Scholar'];
    return titles[index] || 'Ninja Intraining';
  }
}