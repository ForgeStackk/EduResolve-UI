import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forge-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 bg-brand-orange rounded-lg shadow-lg p-4 max-w-xs">
      <div class="flex items-center gap-2">
        <div class="text-white font-bold">Forge AI Assistant</div>
      </div>
      <p class="text-white text-sm mt-2">How can I help you today?</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ForgeAIAssistantComponent {}
