import { Component, Renderer2, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/theme.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Standalone component
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet], // ✅ Ensure RouterOutlet is imported
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const authPages = ['/login','auth/verify-otp','auth/reset-password','auth/forgot-password'];
        const currentRoute = event.url.split('?')[0]; // ✅ Ignore query params

        if (this.isBrowser) {
          if (authPages.includes(currentRoute)) {
            this.renderer.setAttribute(document.body, 'class', 'auth-background'); // ✅ Immediate effect
          } else {
            this.renderer.removeAttribute(document.body, 'class'); // ✅ Removes background when navigating away
          }
        }
        // Reapply theme on route change
        this.themeService.applyTheme();
      });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.themeService.applyTheme();
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
