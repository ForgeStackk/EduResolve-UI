import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ForgeAIAssistantComponent } from './components/forge-ai-assistant/forge-ai-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ForgeAIAssistantComponent],
  template: `
    <router-outlet></router-outlet>
    <app-forge-ai-assistant></app-forge-ai-assistant>
  `
})
export class App {}