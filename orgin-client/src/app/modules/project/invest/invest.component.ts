import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Copy the Project interface from exhibitions component
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
}

@Component({
  selector: 'app-invest',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './invest.component.html',
  styleUrl: './invest.component.scss'
})
export class InvestComponent implements OnInit {
  projectId: string | null = null;
  project: any = null;
  loading: boolean = false;
  error: string | null = null;

  // Popup properties for truncation
  showPopup = false;
  popupContent = '';
  popupTitle = '';

  // Dummy projects data with added ID
  projects: Project[] = [
    {
      id: '358a02eb-f83f-4334-af4a-97f867320b6d',  // Matches Project Alpha in analytics
      title: 'Project Alpha',
      type: 'Technology',
      description: 'A groundbreaking project in technology.',
      image: '../../../assets/images/1.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Alice Johnson',
    },
    {
      id: '3',  // Matches Project Gamma in analytics
      title: 'Project Gamma',
      type: 'Energy',
      description: 'Sustainable energy solutions.',
      image: '../../../assets/images/3.jpg',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Jane Smith',
    },
    {
      id: '5',  // Matches Project Epsilon in analytics
      title: 'Project Epsilon',
      type: 'Finance',
      description: 'Finance solutions for startups.',
      image: '../../../assets/images/5.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Emily Davis',
    },
    {
      id: '8',  // Matches Project Theta in analytics
      title: 'Project Theta',
      type: 'Agriculture',
      description: 'Sustainable farming practices.',
      image: '../../../assets/images/3.jpg',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Emma Johnson',
    },
    {
      id: '10',  // Matches Project Kappa in analytics
      title: 'Project Kappa',
      type: 'Education',
      description: 'Innovative educational tools.',
      image: '../../../assets/images/5.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Olivia Davis',
    },
    {
      id: '14',  // Matches Project Xi in analytics
      title: 'Project Xi',
      type: 'Entertainment',
      description: 'Virtual reality experiences.',
      image: '../../../assets/images/4.jpg',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Mia Rodriguez',
    },
    {
      id: '16',  // Matches Project Pi in analytics
      title: 'Project Pi',
      type: 'Marketing',
      description: 'AI-driven marketing tools.',
      image: '../../../assets/images/1.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Charlotte Lee',
    },
    {
      id: '20',  // Matches Project Upsilon in analytics
      title: 'Project Upsilon',
      type: 'Finance',
      description: 'Digital payment solutions.',
      image: '../../../assets/images/5.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Sophia Wright',
    },
    {
      id: '22',  // Matches Project Chi in analytics
      title: 'Project Chi',
      type: 'Data',
      description: 'Data analytics for businesses.',
      image: '../../../assets/images/2.webp',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'Avery Adams',
    },
    {
      id: '24',  // Matches Project Omega in analytics
      title: 'Project Omega',
      type: 'Blockchain',
      description: 'Blockchain for supply chain.',
      image: '../../../assets/images/4.jpg',
      isInvestment: true,
      status: 'Approved',
      category: 'Investment',
      owner: 'James Carter',
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
      this.loading = false;
    } else {
      this.error = 'Project not found';
      this.loading = false;
      // Optionally redirect to a not found page
      this.router.navigate(['/not-found']);
    }
  }

  investNow() {
    // Implement investment logic
    console.log('Investing in project:', this.projectId);
  }

  // Text truncation and popup methods
  truncateText(text: string, maxLength: number = 80): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  shouldShowViewMore(text: string, maxLength: number = 80): boolean {
    return !!(text && text.length > maxLength);
  }

  showFullText(content: string, title: string): void {
    this.popupContent = content;
    this.popupTitle = title;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupContent = '';
    this.popupTitle = '';
  }
}
