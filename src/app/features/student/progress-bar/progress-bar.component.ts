import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {
  label = input.required<string>();
  progress = input.required<number>();
  colorClass = input<string>('bg-brand-orange');
}
