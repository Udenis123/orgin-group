import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { SidenavComponent } from '../../../shared/sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router'; // ✅ Import RouterOutlet
import { ThemeService } from '../../../core/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [NavbarComponent, SidenavComponent, RouterOutlet] // ✅ Add RouterOutlet
})
export class DashboardComponent {
  isSidenavOpen = true;
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  // Add this method to handle sidenav state changes
  onSidenavToggle(isOpen: boolean) {
    this.isSidenavOpen = isOpen;
  }
}