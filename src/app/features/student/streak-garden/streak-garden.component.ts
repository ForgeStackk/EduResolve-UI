import { Component, Input, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface StreakInfo {
  currentStreak: number;
  missionsCompleted: number;
  loginDays: number;
  gardenState: string;
}

@Component({
  selector: 'app-streak-garden',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex flex-col items-center justify-center p-4">
      @if (streak()?.gardenState === 'TREE') {
        <div class="w-32 h-32 mb-2 flex items-center justify-center" [ngClass]="animateGrowth() ? 'growth-pulse' : ''">
          <lottie-player
            src="https://assets3.lottiefiles.com/packages/lf20_e3q0wtsq.json"
            background="transparent"
            speed="1"
            style="width: 100%; height: 100%; filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));"
            loop
            autoplay>
          </lottie-player>
        </div>
      } @else {
        <div class="text-6xl mb-2 garden-emoji" [ngClass]="animateGrowth() ? 'growth-pulse' : ''">
          {{ getGardenEmoji() }}
        </div>
      }
      <h3 (click)="triggerConfetti()" class="text-white font-bold text-lg mt-2 cursor-pointer hover:text-green-400 transition-colors" title="Click to celebrate!">Streak Garden</h3>
      <p class="text-red-400 font-bold text-2xl">🔥 {{ streak()?.currentStreak || 0 }} Days</p>
      <p class="text-[#e6bdb8]/60 text-xs mt-1 uppercase tracking-widest">{{ streak()?.gardenState || 'SEED' }}</p>
      <p class="text-green-400/70 text-xs mt-0.5">{{ streak()?.loginDays || 0 }} total login days</p>
    </div>
  `,
  styles: [`
    .garden-emoji { filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4)); transition: all 0.3s ease; }
    .growth-pulse { animation: pulse 1s infinite alternate; }
    @keyframes pulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4)); }
      100% { transform: scale(1.15); filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.8)); }
    }
  `]
})
export class StreakGardenComponent implements OnInit {
  @Input() studentId!: number;
  private http = inject(HttpClient);
  
  streak = signal<StreakInfo | null>(null);
  animateGrowth = signal(false);
  private previousState = '';

  ngOnInit() {
    this.loadExternalScripts();

    if (this.studentId) {
      // POST records today's login (idempotent: one increment per IST calendar day)
      // and returns the same payload as GET — one round-trip only.
      this.http.post<StreakInfo>(`${environment.apiBaseUrl}/streaks/${this.studentId}/login`, {})
        .subscribe(data => {
          if (this.previousState && this.previousState !== data.gardenState) {
            if (data.gardenState === 'BLOOM' || data.gardenState === 'TREE') {
              this.triggerConfetti();
              this.triggerGrowthAnimation();
            }
          }
          this.previousState = data.gardenState;
          this.streak.set(data);
        });
    }
  }

  private loadExternalScripts() {
    if (!document.getElementById('lottie-player-script')) {
      const script = document.createElement('script');
      script.id = 'lottie-player-script';
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      document.head.appendChild(script);
    }
    if (!document.getElementById('confetti-script')) {
      const script = document.createElement('script');
      script.id = 'confetti-script';
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      document.head.appendChild(script);
    }
  }

  private triggerGrowthAnimation() {
    this.animateGrowth.set(true);
    setTimeout(() => this.animateGrowth.set(false), 2000);
  }

  triggerConfetti() {
    const tryConfetti = () => {
      if ((window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6']
        });
      } else {
        setTimeout(tryConfetti, 100);
      }
    };
    tryConfetti();
  }

  getGardenEmoji(): string {
    const state = this.streak()?.gardenState || 'SEED';
    switch (state) {
      case 'SPROUT':   return '🌱';
      case 'SEEDLING': return '🌿';
      case 'BLOOM':    return '🌸';
      case 'TREE':     return '🌳';
      case 'SEED':
      default:         return '🌰';
    }
  }
}