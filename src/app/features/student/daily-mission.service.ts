import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface DailyMission {
  id: string;
  codename: string;
  objective: string;
  subject: string;
  xpReward: number;
  type: 'READ' | 'QUIZ' | 'DOUBT';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  route: string[];
  queryParams?: Record<string, string | number>;
}

interface StoredState {
  date: string;
  completed: Record<string, boolean>;
}

const ADJECTIVES   = ['ALPHA', 'DELTA', 'ECHO', 'FOXTROT', 'GAMMA', 'NOVA', 'OMEGA', 'SIGMA', 'TITAN', 'ZETA'];
const NOUNS        = ['STRIKE', 'VORTEX', 'PULSE', 'SURGE', 'PHOTON', 'NEXUS', 'FORGE', 'CIPHER', 'BLAZE', 'STORM'];
const STORE_KEY    = 'eduresolve.daily_missions';
// Student must spend at least this many ms on the target page before credit is given
const MIN_AWAY_MS  = 10_000;

@Injectable({ providedIn: 'root' })
export class DailyMissionService {
  private platformId = inject(PLATFORM_ID);

  private _missions          = signal<DailyMission[]>([]);
  private _completed         = signal<Record<string, boolean>>({});
  // missionId → unix timestamp when it was launched (cleared on completion)
  private _pending           = signal<Record<string, number>>({});
  private _todayDate         = this.todayStr();
  private _timerRef?         : ReturnType<typeof setInterval>;

  readonly missions            = this._missions.asReadonly();
  readonly completed           = this._completed.asReadonly();
  readonly pending             = this._pending.asReadonly();
  readonly yesterdayIncomplete = signal(false);
  readonly timeUntilReset      = signal('--:--:--');

  readonly allDone = computed(() => {
    const c = this._completed();
    return this._missions().length > 0 && this._missions().every(m => !!c[m.id]);
  });

  readonly doneCount = computed(() =>
    Object.values(this._completed()).filter(Boolean).length
  );

  generate(grade: string, subjects: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const today     = this._todayDate;
    const yesterday = this.yesterdayStr();

    // Check yesterday's incomplete state
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const stored: StoredState = JSON.parse(raw);
        if (stored.date === yesterday) {
          const done = Object.values(stored.completed).filter(Boolean).length;
          this.yesterdayIncomplete.set(done < 3);
        }
      }
    } catch {}

    // Load today's persisted completion state
    let completed: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const stored: StoredState = JSON.parse(raw);
        if (stored.date === today) completed = stored.completed;
      }
    } catch {}
    this._completed.set(completed);

    // Generate 3 deterministic missions for today
    const seed = this.hash(today + grade);
    const cfg: Array<{ type: DailyMission['type']; diff: DailyMission['difficulty']; xp: number }> = [
      { type: 'READ',  diff: 'EASY',   xp: 25  },
      { type: 'QUIZ',  diff: 'MEDIUM', xp: 50  },
      { type: 'DOUBT', diff: 'HARD',   xp: 100 },
    ];

    const missions: DailyMission[] = cfg.map(({ type, diff, xp }, i) => {
      const pool = subjects.length ? subjects : ['General'];
      const s    = pool[(seed + i * 3) % pool.length];
      const adj  = ADJECTIVES[(seed + i * 7)      % ADJECTIVES.length];
      const noun = NOUNS     [(seed + i * 11 + 2) % NOUNS.length];
      return {
        id: `${today}-${i}`,
        codename: `${adj} ${noun}`,
        objective: this.objectiveFor(type, s),
        subject: s,
        xpReward: xp,
        type,
        difficulty: diff,
        route: this.routeFor(type),
        queryParams: type === 'READ' ? { subject: s, classGrade: grade } : undefined,
      };
    });

    this._missions.set(missions);
    this.startCountdown();
  }

  /**
   * Called when the user presses LAUNCH. Records the launch time.
   * The mission is NOT marked complete here — only after the student
   * actually uses the app and returns to the dashboard.
   */
  setActive(missionId: string): void {
    this._pending.update(p => ({ ...p, [missionId]: Date.now() }));
  }

  /**
   * Called when the student navigates back to the dashboard.
   * Marks any pending mission as complete only if the student spent
   * at least MIN_AWAY_MS ms on the target page.
   * Returns the IDs of missions that were just completed so the caller
   * can award XP.
   */
  onReturn(): string[] {
    const pending   = this._pending();
    const now       = Date.now();
    const justDone: string[] = [];

    for (const [id, ts] of Object.entries(pending)) {
      if (now - ts >= MIN_AWAY_MS) {
        justDone.push(id);
        this._markComplete(id);
      }
    }

    if (justDone.length > 0) {
      // Remove completed entries from pending map
      this._pending.update(p => {
        const next = { ...p };
        justDone.forEach(id => delete next[id]);
        return next;
      });
    }

    return justDone;
  }

  /** Directly mark a mission complete (used only for quiz/doubt pages that can self-report). */
  completeMission(missionId: string): void {
    this._markComplete(missionId);
    this._pending.update(p => {
      const next = { ...p };
      delete next[missionId];
      return next;
    });
  }

  destroy(): void {
    if (this._timerRef) clearInterval(this._timerRef);
  }

  // ── private helpers ──────────────────────────────────────────────

  private _markComplete(missionId: string): void {
    const updated = { ...this._completed(), [missionId]: true };
    this._completed.set(updated);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        date: this._todayDate,
        completed: updated,
      }));
    } catch {}
  }

  private objectiveFor(type: DailyMission['type'], subject: string): string {
    return {
      READ:  `Read a ${subject} chapter`,
      QUIZ:  `Complete a ${subject} quiz`,
      DOUBT: `Clear your ${subject} doubt`,
    }[type];
  }

  private routeFor(type: DailyMission['type']): string[] {
    return { READ: ['/learn/books'], QUIZ: ['/learn/quiz'], DOUBT: ['/learn/doubt'] }[type];
  }

  private startCountdown(): void {
    if (this._timerRef) clearInterval(this._timerRef);
    const tick = () => {
      const now      = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      this.timeUntilReset.set(`${h}:${m}:${s}`);
    };
    tick();
    this._timerRef = setInterval(tick, 1000);
  }

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private yesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  private hash(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
      h = h >>> 0;
    }
    return h;
  }
}
