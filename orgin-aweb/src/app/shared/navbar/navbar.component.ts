import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';
import { LanguageService } from '../../core/language.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  menuOpen = false;
  centerMenuOpen = false;
  isDarkMode = false;
  currentLanguage: string = 'en';
  clientUrl = environment.clientUrl;

  constructor(
    public translate: TranslateService, 
    public themeService: ThemeService,
    private languageService: LanguageService
  ) {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.currentLanguage);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Check if click is outside both menus
    const target = event.target as HTMLElement;
    
    // Check if click is on menu buttons (don't close if clicking on buttons)
    const isMenuButton = target.closest('.center-menu-btn') || 
                        target.closest('.mobile-menu-btn') ||
                        target.closest('.navbar-toggler');
    
    // Check if click is inside the menus
    const isInsideCenterMenu = target.closest('.center-menu-options');
    const isInsideMobileMenu = target.closest('.mobile-menu');
    
    // Close menus if clicking outside and not on menu buttons
    if (!isMenuButton && !isInsideCenterMenu && !isInsideMobileMenu) {
      this.menuOpen = false;
      this.centerMenuOpen = false;
    }
  }

  toggleMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.menuOpen = !this.menuOpen;
  }

  toggleCenterMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.centerMenuOpen = !this.centerMenuOpen;
  }

  closeCenterMenu() {
    this.centerMenuOpen = false;
  }

  changeLanguage(event: Event) {
    const selectedLang = (event.target as HTMLSelectElement).value;
    console.log(`Language selected: ${selectedLang}`);
    
    this.translate.use(selectedLang);
    this.translate.setDefaultLang(selectedLang);
    
    this.languageService.getTranslations(selectedLang).subscribe({
      next: (translations) => {
        console.log(`Translations loaded for: ${selectedLang}`, translations);
        this.translate.setTranslation(selectedLang, translations, true);
      },
      error: (err) => {
        console.error(`Failed to load translations for ${selectedLang}:`, err);
        // Fallback to English if translation fails
        if (selectedLang !== 'en') {
          this.translate.use('en');
          this.currentLanguage = 'en';
        }
      }
    });
    
    localStorage.setItem('selectedLanguage', selectedLang);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkTheme();
  }
}
