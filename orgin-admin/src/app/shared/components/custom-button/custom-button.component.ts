import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CustomButtonComponent {
  @Input() buttonClass: string = '';
  @Input() disabled: boolean = false;
  @Input() type: string = 'button';
  @Output() onClick = new EventEmitter<Event>();
}
