import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss']
})
export class CustomButtonComponent {
  @Input() buttonClass: string = '';
  @Input() disabled: boolean = false;
  @Input() type: string = 'button';
  @Output() onClick = new EventEmitter<Event>();
}
