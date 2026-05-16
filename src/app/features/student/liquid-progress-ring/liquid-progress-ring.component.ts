import { Component, Input, OnChanges } from '@angular/core';

/**
 * Animated SVG progress ring.
 * Renders a glowing arc that fills clockwise as `progress` (0-100) increases.
 * The tip dot and glow layer animate together via CSS transitions.
 */
@Component({
  selector: 'app-liquid-progress-ring',
  standalone: true,
  template: `
    <div class="ring-wrapper" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="ring-svg" aria-hidden="true">

        <!-- Background track -->
        <circle
          [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radius"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          [attr.stroke-width]="stroke" />

        <!-- Glow layer (blurred duplicate for luminous effect) -->
        <circle
          [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radius"
          fill="none"
          [attr.stroke]="color"
          [attr.stroke-width]="stroke + 6"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circ"
          [attr.stroke-dashoffset]="dashOffset"
          [attr.transform]="rotateAttr"
          class="ring-glow" />

        <!-- Main arc -->
        <circle
          [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radius"
          fill="none"
          [attr.stroke]="color"
          [attr.stroke-width]="stroke"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circ"
          [attr.stroke-dashoffset]="dashOffset"
          [attr.transform]="rotateAttr"
          class="ring-arc" />

        <!-- Tip dot (only when arc has enough length) -->
        @if (progress > 3) {
          <circle
            [attr.cx]="dotX" [attr.cy]="dotY" r="5"
            [attr.fill]="color"
            class="ring-tip" />
        }
      </svg>

      <!-- Center content -->
      <div class="ring-inner">
        <span class="ring-val">{{ centerValue }}</span>
        <span class="ring-lbl">{{ label }}</span>
        <span class="ring-rank" [style.color]="color">{{ sublabel }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }

    .ring-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ring-svg {
      position: absolute;
      top: 0; left: 0;
      overflow: visible;
      transform: scaleX(-1) rotate(180deg); /* ensures arc starts at top and fills clockwise when read LTR */
    }

    /* Actually let's not flip - the rotate(-90) in rotateAttr handles starting position */
    .ring-svg { transform: none; }

    .ring-glow {
      opacity: 0.22;
      filter: blur(5px);
      transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease;
    }

    .ring-arc {
      transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease;
    }

    .ring-tip {
      animation: tip-pulse 2s ease-in-out infinite;
      transition: cx 1.4s cubic-bezier(0.4, 0, 0.2, 1),
                  cy 1.4s cubic-bezier(0.4, 0, 0.2, 1),
                  fill 0.4s ease;
    }

    @keyframes tip-pulse {
      0%, 100% { opacity: 1; r: 5; }
      50%       { opacity: 0.6; r: 3.5; }
    }

    .ring-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      pointer-events: none;
    }

    .ring-val {
      font-family: 'Lexend', 'Inter', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .ring-lbl {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(230,189,184,0.55);
    }

    .ring-rank {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition: color 0.4s ease;
    }
  `]
})
export class LiquidProgressRingComponent implements OnChanges {
  @Input() progress = 0;
  @Input() color    = '#2DD4BF';
  @Input() centerValue: string | number = 0;
  @Input() label    = 'STREAK PTS';
  @Input() sublabel = 'Beginner';
  @Input() size     = 160;
  @Input() stroke   = 10;

  cx = 80; cy = 80; radius = 65;
  circ = 0; dashOffset = 0;
  rotateAttr = '';
  dotX = 80; dotY = 15;

  ngOnChanges(): void {
    this.cx     = this.size / 2;
    this.cy     = this.size / 2;
    this.radius = (this.size - this.stroke * 2 - 8) / 2;
    this.circ   = 2 * Math.PI * this.radius;

    const pct        = Math.min(100, Math.max(0, this.progress));
    this.dashOffset  = this.circ * (1 - pct / 100);
    this.rotateAttr  = `rotate(-90 ${this.cx} ${this.cy})`;

    // Compute tip dot coordinates
    const angleRad = ((pct / 100) * 360 - 90) * (Math.PI / 180);
    this.dotX = this.cx + this.radius * Math.cos(angleRad);
    this.dotY = this.cy + this.radius * Math.sin(angleRad);
  }
}
