import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notice-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notice-card.component.html',
  styleUrl: './notice-card.component.css'
})
export class NoticeCardComponent {
  title = input.required<string>();
  date = input.required<string>();
  content = input.required<string>();
}