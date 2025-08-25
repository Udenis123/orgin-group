import { Component, HostListener, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
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
export class NavbarComponent implements AfterViewInit {
  centerMenuOpen = false;
  isDarkMode = false;
  currentLanguage: string = 'en';
  clientUrl = environment.clientUrl;
  isScrolled = false;
  isNavbarVisible = true;
  lastScrollTop = 0;

  constructor(
    public translate: TranslateService, 
    public themeService: ThemeService,
    private languageService: LanguageService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.currentLanguage);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngAfterViewInit() {
    this.initializeAnimations();
    this.setupMagneticEffects();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY;
    this.isScrolled = scrollTop > 10;
    
    // Hide/show navbar on scroll
    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      this.isNavbarVisible = false;
    } else {
      this.isNavbarVisible = true;
    }
    this.lastScrollTop = scrollTop;
    
    // Add parallax effect to background
    this.addParallaxEffect(scrollTop);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Check if click is outside center menu
    const target = event.target as HTMLElement;
    
    // Check if click is on menu button (don't close if clicking on button)
    const isMenuButton = target.closest('.center-menu-btn');
    
    // Check if click is inside the menu
    const isInsideCenterMenu = target.closest('.center-menu-options');
    
    // Close menu if clicking outside and not on menu button
    if (!isMenuButton && !isInsideCenterMenu) {
      this.centerMenuOpen = false;
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    // Reinitialize animations on resize
    setTimeout(() => {
      this.initializeAnimations();
    }, 100);
  }

  private initializeAnimations() {
    const navbar = this.elementRef.nativeElement.querySelector('.main-navbar');
    if (navbar) {
      // Add entrance animation
      this.renderer.addClass(navbar, 'navbar-entrance');
      
      // Add intersection observer for scroll animations
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'animate-in');
        }
      });
    }, { threshold: 0.1 });

    // Observe navigation links
    const navLinks = this.elementRef.nativeElement.querySelectorAll('.nav-link');
    navLinks.forEach((link: Element) => {
      observer.observe(link);
    });
  }

  private setupMagneticEffects() {
    const magneticElements = this.elementRef.nativeElement.querySelectorAll('.theme-toggle, .login-btn, .center-menu-btn');
    
    magneticElements.forEach((element: HTMLElement) => {
      element.addEventListener('mousemove', (e) => {
        this.applyMagneticEffect(e, element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetMagneticEffect(element);
      });
    });
  }

  private applyMagneticEffect(event: MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    
    const strength = 0.3;
    const transformX = x * strength;
    const transformY = y * strength;
    
    this.renderer.setStyle(element, 'transform', `translate(${transformX}px, ${transformY}px)`);
  }

  private resetMagneticEffect(element: HTMLElement) {
    this.renderer.setStyle(element, 'transform', 'translate(0px, 0px)');
  }

  private addParallaxEffect(scrollTop: number) {
    const navbar = this.elementRef.nativeElement.querySelector('.main-navbar');
    if (navbar) {
      const parallaxValue = scrollTop * 0.5;
      this.renderer.setStyle(navbar, 'background-position', `center ${parallaxValue}px`);
    }
  }

  toggleCenterMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.centerMenuOpen = !this.centerMenuOpen;
    
    // Add menu toggle animation
    if (this.centerMenuOpen) {
      this.animateMenuOpen();
    } else {
      this.animateMenuClose();
    }
  }

  private animateMenuOpen() {
    const menuOptions = this.elementRef.nativeElement.querySelector('.center-menu-options');
    if (menuOptions) {
      this.renderer.addClass(menuOptions, 'menu-opening');
      
      // Animate each menu item with stagger
      const menuItems = menuOptions.querySelectorAll('.nav-link');
      menuItems.forEach((item: Element, index: number) => {
        setTimeout(() => {
          this.renderer.addClass(item, 'menu-item-visible');
        }, index * 100);
      });
    }
  }

  private animateMenuClose() {
    const menuOptions = this.elementRef.nativeElement.querySelector('.center-menu-options');
    if (menuOptions) {
      this.renderer.removeClass(menuOptions, 'menu-opening');
      
      const menuItems = menuOptions.querySelectorAll('.nav-link');
      menuItems.forEach((item: Element) => {
        this.renderer.removeClass(item, 'menu-item-visible');
      });
    }
  }

  closeCenterMenu() {
    this.centerMenuOpen = false;
    this.animateMenuClose();
  }

  changeLanguage(event: Event) {
    const selectedLang = (event.target as HTMLSelectElement).value;
    console.log(`Language selected: ${selectedLang}`);
    
    // Add language change animation
    this.animateLanguageChange(selectedLang);
    
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

  private animateLanguageChange(language: string) {
    const langSelect = this.elementRef.nativeElement.querySelector('.lang-select');
    if (langSelect) {
      this.renderer.addClass(langSelect, 'language-changing');
      setTimeout(() => {
        this.renderer.removeClass(langSelect, 'language-changing');
      }, 300);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkTheme();
    
    // Add theme toggle animation
    this.animateThemeToggle();
  }

  private animateThemeToggle() {
    const themeToggle = this.elementRef.nativeElement.querySelector('.theme-toggle');
    if (themeToggle) {
      this.renderer.addClass(themeToggle, 'theme-toggling');
      setTimeout(() => {
        this.renderer.removeClass(themeToggle, 'theme-toggling');
      }, 500);
    }
  }

  // Add ripple effect to buttons
  createRippleEffect(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const ripple = this.renderer.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);
    this.renderer.addClass(ripple, 'ripple');
    
    this.renderer.appendChild(button, ripple);
    
    setTimeout(() => {
      this.renderer.removeChild(button, ripple);
    }, 600);
  }
}
