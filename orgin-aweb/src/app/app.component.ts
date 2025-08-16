import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // ✅ Import here

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    FooterComponent, 
    TranslateModule // ✅ Use TranslateModule directly in the component
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'orgin-website';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Check localStorage for saved language or default to 'en'
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    
    // Add this to verify translations are loaded
    this.translate.get('HOME').subscribe((res: string) => {
      
    });
  }
}
