import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';
import { HomeService, Project } from '../../services/home.service';
import { environment } from '../../../environments/environment';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { BookmarkService } from '../../services/bookmark.service';
import { CookieService } from '../../services/cookie.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
  readTime: string;
  url: string;
}

@Component({
  selector: 'app-community-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    NgbCarouselModule
    
  ],
  templateUrl: './community-projects.component.html',
  styleUrls: ['./community-projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommunityProjectsComponent implements OnInit {
  clientUrl = environment.clientUrl;
  currentLang: string = 'en';
  searchCriteria = {
    category: '',
    owner: '',
    requiredMember: '',
    financialCategory: '',
    feasibilityLocation: ''
  };
  categories: string[] = [];
  financialCategories: string[] = [];
  feasibilityLocations: { city: string; country: string }[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  showResults = false;
  displayTitle = '';
  showForm = true;

  articles: Article[] = [];
  groupedArticles: Article[][] = [];
  articlesPerSlide = 3;

  constructor(
    private translate: TranslateService,
    private translationService: TranslationService,
    private homeService: HomeService,
    private router: Router,
    private bookmarkService: BookmarkService,
    private cookieService: CookieService
  ) {
    this.displayTitle = this.translate.instant('COMMUNITY_PROJECTS_TITLE');
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang = event.lang;
      this.updateDisplayTitle();
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.loadCategories();
    this.loadFinancialCategories();
    this.loadFeasibilityLocations();
    this.loadArticles();
    this.updateArticlesChunking();
    window.addEventListener('resize', this.updateArticlesChunking.bind(this));
  }

  loadProjects() {
    this.homeService.getHomeProjects().subscribe({
      next: (projects) => {
        const communityProjects = projects.filter(p => p.projectType === 'community');
        this.projects = communityProjects;
        this.filteredProjects = communityProjects.slice(0, 20);
        this.showResults = false;
        this.updateDisplayTitle();
      },
      error: (err) => {
        this.projects = [];
        this.filteredProjects = [];
      }
    });
  }

  loadCategories() {
    this.homeService.getUniqueCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadFinancialCategories() {
    // Dummy data, replace with API if available
    this.financialCategories = ['Seed', 'Series A', 'Series B', 'Grant', 'Donation', 'Other'];
  }

  loadFeasibilityLocations() {
    // Dummy data, replace with API if available
    this.feasibilityLocations = [
      { city: 'Kigali', country: 'Rwanda' },
      { city: 'Paris', country: 'France' },
      { city: 'New York', country: 'USA' },
      { city: 'London', country: 'UK' },
      { city: 'Other', country: '' }
    ];
  }

  loadArticles() {
    // Use router links for article URLs
    this.articles = [
      {
        id: '1',
        title: 'Understanding Community Projects',
        summary: 'A comprehensive guide to community-driven development projects and their impact on local economies.',
        imageUrl: '../../../assets/images/1.webp',
        date: '2024-03-15',
        readTime: '5 min read',
        url: '/articles/1'
      },
      {
        id: '2',
        title: 'Success Stories in Community Development',
        summary: 'Exploring successful community projects and the lessons learned from their implementation.',
        imageUrl: '../../../assets/images/2.webp',
        date: '2024-03-14',
        readTime: '7 min read',
        url: '/articles/2'
      },
      {
        id: '3',
        title: 'Innovation in Local Projects',
        summary: 'How innovative approaches are transforming community projects and creating sustainable solutions.',
        imageUrl: '../../../assets/images/3.jpg',
        date: '2024-03-13',
        readTime: '4 min read',
        url: '/articles/3'
      },
      {
        id: '4',
        title: 'Community Engagement Strategies',
        summary: 'Effective strategies for engaging community members in local development projects.',
        imageUrl: '../../../assets/images/4.jpg',
        date: '2024-03-12',
        readTime: '6 min read',
        url: '/articles/4'
      },
      {
        id: '5',
        title: 'Sustainable Community Development',
        summary: 'Building sustainable and resilient communities through effective project management.',
        imageUrl: '../../../assets/images/5.webp',
        date: '2024-03-11',
        readTime: '8 min read',
        url: '/articles/5'
      }
    ];
    this.updateArticlesChunking();
  }

  onOwnerInput(event: Event) {
    // Optionally debounce or handle input
    // For now, just update the search
    // this.searchProjects();
  }

  searchProjects() {
    let filtered = [...this.projects];
    if (this.searchCriteria.category) {
      filtered = filtered.filter(project => project.category === this.searchCriteria.category);
    }
    if (this.searchCriteria.owner) {
      const ownerSearch = this.searchCriteria.owner.toLowerCase().trim();
      filtered = filtered.filter(project => project.owner && project.owner.toLowerCase().includes(ownerSearch));
    }
    if (this.searchCriteria.requiredMember) {
      filtered = filtered.filter(project =>
        project.requiredMembers && project.requiredMembers.some((member: string) =>
          member.toLowerCase().includes(this.searchCriteria.requiredMember.toLowerCase())
        )
      );
    }
    if (this.searchCriteria.financialCategory) {
      filtered = filtered.filter(project => project.financialCategory === this.searchCriteria.financialCategory);
    }
    if (this.searchCriteria.feasibilityLocation) {
      filtered = filtered.filter(project => {
        if (!project.feasibilityLocation) return false;
        if (typeof project.feasibilityLocation === 'string') {
          return project.feasibilityLocation === this.searchCriteria.feasibilityLocation;
        } else if (typeof project.feasibilityLocation === 'object' && 'city' in (project.feasibilityLocation as any)) {
          return (project.feasibilityLocation as any).city === this.searchCriteria.feasibilityLocation;
        }
        return false;
      });
    }
    this.filteredProjects = filtered.slice(0, 20);
    this.showResults = true;
    this.updateDisplayTitle();
  }

  clearSearch() {
    this.searchCriteria = {
      category: '',
      owner: '',
      requiredMember: '',
      financialCategory: '',
      feasibilityLocation: ''
    };
    this.filteredProjects = this.projects.slice(0, 20);
    this.showResults = false;
    this.updateDisplayTitle();
  }

  updateDisplayTitle() {
    if (this.showResults && this.filteredProjects.length > 0) {
      this.displayTitle = this.translate.instant('COMMUNITY_PROJECTS_FILTERED');
    } else {
      this.displayTitle = this.translate.instant('COMMUNITY_PROJECTS_TITLE');
    }
  }

  joinProject(projectId: string) {
    window.open(`${this.clientUrl}/dashboard/project/join/${projectId}`, '_blank');
  }

  openArticle(url: string) {
    this.router.navigateByUrl(url);
  }

  // Responsive chunking for articles
  updateArticlesChunking() {
    let chunkSize = 3;
    const width = window.innerWidth;
    if (width <= 912) {
      chunkSize = 1;
    } else if (width <= 992) {
      chunkSize = 2;
    } else if (width <= 1200) {
      chunkSize = 3;
    }
    this.articlesPerSlide = chunkSize;
    this.groupedArticles = this.chunkArray(this.articles, chunkSize);
  }

  // Generic chunking method
  chunkArray(array: any[], size: number): any[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
  }
} 