import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Project {
  id: string;
  title: string;
  type: string;
  description: string;
  image: string;
  isInvestment?: boolean;
  status: string;
  category: string;
  owner: string;
  isBuy: boolean;
  purpose: 'buy without ownership' | 'buy with ownership';
}

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './buy.component.html',
  styleUrl: './buy.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BuyComponent implements OnInit {
  projectId: string | null = null;
  project: Project | null = null;
  loading = true;
  error: string | null = null;
  buyOption: 'buy without ownership' | 'buy with ownership' = 'buy without ownership';
  continueDevelopment: boolean = false;
  showBuyOptions = true;

  // Dummy projects data with added ID
  projects: Project[] = [
    {
      id: '6',
      title: 'Project Zeta',
      type: 'Technology',
      description: 'Next-gen AI solutions.',
      image: '../../../assets/images/1.webp',
      isInvestment: false,
      status: 'Approved',
      category: 'Purchase',
      owner: 'Sophia Turner',
      isBuy: true,
      purpose: 'buy without ownership'
    },
    {
      id: '12',
      title: 'Project Mu',
      type: 'Finance',
      description: 'Blockchain for secure transactions.',
      image: '../../../assets/images/2.webp',
      isInvestment: false,
      status: 'Approved',
      category: 'Purchase',
      owner: 'Ava Martinez',
      isBuy: true,
      purpose: 'buy with ownership'
    },
    {
      id: '18',
      title: 'Project Sigma',
      type: 'Health',
      description: 'Telemedicine innovations.',
      image: '../../../assets/images/3.jpg',
      isInvestment: false,
      status: 'Approved',
      category: 'Purchase',
      owner: 'Isabella Young',
      isBuy: true,
      purpose: 'buy without ownership'
    },
    {
      id: '22',
      title: 'Project Chi',
      type: 'Data',
      description: 'Data analytics for businesses.',
      image: '../../../assets/images/2.webp',
      isInvestment: false,
      status: 'Approved',
      category: 'Purchase',
      owner: 'Avery Adams',
      isBuy: true,
      purpose: 'buy with ownership'
    },
    {
      id: '24',
      title: 'Project Omega',
      type: 'Blockchain',
      description: 'Blockchain for supply chain.',
      image: '../../../assets/images/4.jpg',
      isInvestment: false,
      status: 'Approved',
      category: 'Purchase',
      owner: 'James Carter',
      isBuy: true,
      purpose: 'buy without ownership'
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Get the project ID from the route parameters
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
      
      if (this.projectId) {
        this.loadProject();
      } else {
        this.error = 'No project ID provided';
        this.loading = false;
      }
    });
  }

  loadProject(): void {
    this.loading = true;
    
    // Find project by ID
    const foundProject = this.projects.find(p => 
      p.id === this.projectId
    );

    if (foundProject) {
      this.project = foundProject;
      // Set buy option based on project purpose
      this.buyOption = this.project.purpose;
      // Show options only if purpose is not already set
      this.showBuyOptions = this.project.purpose === undefined;
      this.loading = false;
    } else {
      this.error = 'Project not found';
      this.loading = false;
      // Optionally redirect to a not found page
      this.router.navigate(['/not-found']);
    }
  }

  buyNow(): void {
    if (this.projectId) {
      // Navigate to the scheduling page for buy projects
      this.router.navigate(['/dashboard/schedule/buy', this.projectId]);
    }
  }

  getTotalPrice(): number {
    let basePrice = 1000000; // Replace with actual price calculation
    let total = basePrice;
    
    if (this.buyOption === 'buy with ownership') {
      total += 500000; // Ownership premium
    }
    
    if (this.continueDevelopment) {
      total += 300000; // Development fee
    }
    
    return total;
  }
}
