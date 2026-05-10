import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NCERTResource } from '../../../core/api/ncert-api.service';

/**
 * Interactive visualization component for NCERT resources
 * Displays diagrams, 3D models, interactive tools, and enriched content
 */
@Component({
  selector: 'app-interactive-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      @if (resources && resources.length > 0) {
        <div class="mb-6">
          <h3 class="hud-display text-lg text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-red-500">palette</span>
            INTERACTIVE VISUALIZATIONS
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (resource of resources; track resource.id) {
              <div class="hud-card-flat p-4">
                <div class="hud-accent"></div>
                <div class="mb-3">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-symbols-outlined text-red-400">
                      {{ getIcon(resource.type) }}
                    </span>
                    <h4 class="hud-display text-base text-white">{{ resource.title }}</h4>
                  </div>
                  <p class="text-sm text-[#e6bdb8]/80">{{ resource.description }}</p>
                </div>

                <!-- Diagram/Image Display -->
                @if (resource.type === 'diagram' && resource.imageUrl) {
                  <div class="rounded-lg overflow-hidden border border-white/10 mt-3">
                    <img [src]="resource.imageUrl" [alt]="resource.title"
                         class="w-full h-auto hover:scale-105 transition-transform"/>
                  </div>
                }

                <!-- 3D Model Display -->
                @if (resource.type === '3d-model' && resource.imageUrl) {
                  <div class="rounded-lg overflow-hidden border border-white/10 mt-3 bg-black/50 aspect-video flex items-center justify-center">
                    <img [src]="resource.imageUrl" [alt]="resource.title"
                         class="w-full h-auto"/>
                    <div class="absolute text-center text-[#e6bdb8]/70 text-xs">
                      <p>Interactive 3D Visualization</p>
                      <p class="text-xs mt-1">(Click to explore in fullscreen)</p>
                    </div>
                  </div>
                }

                <!-- Interactive Canvas -->
                @if (resource.type === 'interactive' && resource.data) {
                  <div class="rounded-lg overflow-hidden border border-white/10 mt-3 bg-black/50 p-4 aspect-video flex items-center justify-center">
                    <div class="text-center">
                      <span class="material-symbols-outlined text-red-400" style="font-size: 48px;">
                        touch_app
                      </span>
                      <p class="text-[#e6bdb8] text-sm mt-2">Interactive Tool</p>
                      <p class="text-[#e6bdb8]/70 text-xs mt-1">Drag, rotate, and interact with the visualization</p>
                    </div>
                  </div>
                }

                <!-- Video Display -->
                @if (resource.type === 'video' && resource.url) {
                  <div class="rounded-lg overflow-hidden border border-white/10 mt-3 aspect-video">
                    <iframe [src]="resource.url" class="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                  </div>
                }

                <!-- View Details Button -->
                <button class="mt-4 w-full hud-btn-ghost text-sm">
                  <span class="material-symbols-outlined" style="font-size: 16px">open_in_full</span>
                  VIEW IN FULL SCREEN
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InteractiveContentComponent {
  @Input() resources: NCERTResource[] | null = null;

  getIcon(type: string): string {
    switch (type) {
      case 'diagram': return 'schema';
      case 'map': return 'map';
      case '3d-model': return 'cube_scan';
      case 'interactive': return 'touch_app';
      case 'video': return 'play_circle';
      default: return 'palette';
    }
  }
}
