import { Injectable, signal, computed } from '@angular/core';

export type QuizSize = 5 | 10 | 20;
export type StreakRank = 'Beginner' | 'Intermediate' | 'Expert';

export interface QuizResult {
  size: QuizSize;
  correct: number;
}

interface RankTier {
  rank: StreakRank;
  minPts: number;
  maxPts: number | null;
  color: string;
  icon: string;
}

const RANK_TIERS: RankTier[] = [
  { rank: 'Beginner',     minPts: 0,  maxPts: 49,   color: '#CD7F32', icon: 'military_tech'  },
  { rank: 'Intermediate', minPts: 50, maxPts: 90,   color: '#2DD4BF', icon: 'workspace_premium' },
  { rank: 'Expert',       minPts: 91, maxPts: null, color: '#A855F7', icon: 'stars'            },
];

@Injectable({ providedIn: 'root' })
export class StreakEngineService {
  private _pts = signal(0);
  readonly streakPoints = this._pts.asReadonly();

  private _tier = computed<RankTier>(() => {
    const pts = this._pts();
    return [...RANK_TIERS].reverse().find(t => pts >= t.minPts) ?? RANK_TIERS[0];
  });

  readonly rank        = computed(() => this._tier().rank);
  readonly rankColor   = computed(() => this._tier().color);
  readonly rankIcon    = computed(() => this._tier().icon);

  /** 0-100: progress within current rank tier */
  readonly rankProgress = computed(() => {
    const tier = this._tier();
    const pts  = this._pts();
    if (tier.maxPts === null) return 100;
    const span = tier.maxPts - tier.minPts + 1;
    return Math.min(100, Math.round(((pts - tier.minPts) / span) * 100));
  });

  readonly ptsToNextRank = computed(() => {
    const tier = this._tier();
    const pts  = this._pts();
    if (tier.maxPts === null) return 0;
    return tier.maxPts - pts + 1;
  });

  /**
   * Point distribution per spec:
   *  5-Q:  3-5 correct → 1 pt
   * 10-Q:  4-6 correct → 1 pt | 7-10 correct → 3 pts
   * 20-Q: 13-15 correct → 1 pt | 16-18 → 3 pts | 19-20 → 5 pts
   */
  calculatePoints(result: QuizResult): number {
    const { size, correct } = result;
    if (size === 5)  return correct >= 3 ? 1 : 0;
    if (size === 10) return correct >= 7 ? 3 : correct >= 4 ? 1 : 0;
    // 20-Q
    if (correct >= 19) return 5;
    if (correct >= 16) return 3;
    if (correct >= 13) return 1;
    return 0;
  }

  /** Apply quiz result, returns points actually earned. */
  addPoints(result: QuizResult): number {
    const earned = this.calculatePoints(result);
    this._pts.update(p => p + earned);
    return earned;
  }

  /** Seed from backend XP on dashboard load. */
  seedPoints(pts: number): void {
    this._pts.set(pts);
  }

  /** Award raw streak points (e.g. from mission completion). */
  awardXp(amount: number): void {
    this._pts.update(p => Math.min(100, p + amount));
  }
}
