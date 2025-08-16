import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class PrivacyPolicyComponent implements OnInit, AfterViewInit {
  lastUpdated: string = 'May 11, 2025';
  dpoEmail: string = 'dpo@origingroup.com';
  dpoPhone: string = '+250-795-580-462';
  supportEmail: string = 'origingroup299@gmail.com';
  
  constructor() {
    console.log('PrivacyPolicyComponent: Constructor called');
  }

  ngOnInit(): void {
    console.log('PrivacyPolicyComponent: ngOnInit called');
    // Scroll to top when component loads
    window.scrollTo(0, 0);
    
    // Log the template variables
    console.log('Template variables:', {
      lastUpdated: this.lastUpdated,
      dpoEmail: this.dpoEmail,
      dpoPhone: this.dpoPhone,
      supportEmail: this.supportEmail
    });
  }

  ngAfterViewInit(): void {
    console.log('PrivacyPolicyComponent: ngAfterViewInit called');
    // Check if the main container is rendered
    const container = document.querySelector('.privacy-container');
    console.log('Privacy container found:', !!container);
    if (container) {
      console.log('Container content:', container.innerHTML.substring(0, 100) + '...');
    }
  }

  scrollToSection(sectionId: string): void {
    console.log('Attempting to scroll to section:', sectionId);
    const element = document.getElementById(sectionId);
    console.log('Section element found:', !!element);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}