import { Component, AfterViewInit, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';
import { HomeService, Project, UserRating } from '../../services/home.service';
import { environment } from '../../../environments/environment';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';


declare var bootstrap: any;

interface SearchCriteria {
  category: string;
  financialCategory: string;
  businessField: string;
  location: string;
  purpose: string;
  owner: string;
  feasibilityLocation: string;
  projectType: string;
}

interface Feedback {
  name: string;
  message: string;
  rating: number;
  profilePic: string;
}

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
  selector: 'app-business-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbCarouselModule],
  templateUrl: './business-projects.component.html',
  styleUrls: ['./business-projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BusinessProjectsComponent implements AfterViewInit, OnInit, OnDestroy {
  clientUrl = environment.clientUrl;
  websiteUrl = environment.websiteUrl;
  text: string = "Orgin Group is committed to connecting innovators with investors, supporting business projects and exhibitions across various industries.";
  speed: number = 40;
  selectedOption: string = 'all';
  showResults: boolean = false;
  showForm: boolean = true;
  noProjectsAvailable: boolean = false;
  public currentLang: string = 'en';
  feedbackChunks: any[] = [];

  private originalProjects: Project[] = [];

  searchCriteria: SearchCriteria = {
    category: '',
    financialCategory: '',
    businessField: '',
    location: '',
    purpose: '',
    owner: '',
    feasibilityLocation: '',
    projectType: ''
  };

  categories: string[] = [];
  businessFields: string[] = ['Tech', 'Health', 'Finance', 'Education', 'Energy', 'Manufacturing'];
  locations: string[] = ['Kigali', 'Musanze', 'Rubavu', 'Huye', 'Ruhango'];
  financialCategories: string[] = ['Regular (0 - 20M)', 'Standard (20 - 50M)', 'Premium (50 - 100M)', 'Imena (100M+)'];

  projects: Project[] = [];
  filteredProjects: Project[] = [];

  feedbacks: UserRating[] = [];

  feasibilityLocations: { city: string; country: string }[] = [
    { city: 'Kigali', country: 'Rwanda' },
    { city: 'Musanze', country: 'Rwanda' },
    { city: 'Rubavu', country: 'Rwanda' },
    { city: 'Huye', country: 'Rwanda' },
    { city: 'Ruhango', country: 'Rwanda' },
    { city: 'Nairobi', country: 'Kenya' },
    { city: 'Dar es Salaam', country: 'Tanzania' },
    { city: 'Kampala', country: 'Uganda' },
    { city: 'Johannesburg', country: 'South Africa' },
    { city: 'Lagos', country: 'Nigeria' }
  ];

  displayTitle: string = 'All Projects';

  // --- Brokered Projects Section ---
  brokeredProjects: any[] = [
    {
      title: 'Tech Innovation Hub',
      type: 'Technology',
      description: 'A state-of-the-art technology innovation center',
      buyer: 'Tech Investors Ltd',
      seller: 'Innovation Holdings',
      image: '../../../assets/images/1.webp',
      isInvestment: true,
      website: 'https://example.com'
    },
    {
      title: 'Green Energy Plant',
      type: 'Energy',
      description: 'Renewable energy production facility',
      buyer: 'EcoPower Corp',
      seller: 'Green Ventures',
      image: '../../../assets/images/2.webp'
    },
    {
      title: 'Medical Research Center',
      type: 'Healthcare',
      description: 'Advanced medical research facility',
      buyer: 'Healthcare Investments',
      seller: 'Research Holdings',
      image: '../../../assets/images/3.jpg',
      isInvestment: true
    },
    {
      title: 'Smart Manufacturing Plant',
      type: 'Manufacturing',
      description: 'Automated manufacturing facility',
      buyer: 'Industrial Solutions',
      seller: 'Factory Holdings',
      image: '../../../assets/images/4.jpg'
    },
    {
      title: 'Data Center Complex',
      type: 'Technology',
      description: 'High-capacity data storage facility',
      buyer: 'Cloud Systems Inc',
      seller: 'Tech Properties',
      image: '../../../assets/images/5.webp'
    },
    {
      title: 'Biotech Laboratory',
      type: 'Healthcare',
      description: 'Advanced biotechnology research lab',
      buyer: 'BioTech Ventures',
      seller: 'Science Holdings',
      image: '../../../assets/images/1.webp',
      isInvestment: true
    }
  ];

  groupedBrokeredProjects = this.chunkArray(this.brokeredProjects, 4);

  articles: Article[] = [];
  groupedArticles: Article[][] = [];
  articlesPerSlide = 3;

  constructor(
    private translate: TranslateService,
    private translationService: TranslationService,
    private homeService: HomeService
  ) {
    this.displayTitle = this.translate.instant('DISPLAY_TITLE_ALL');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang = event.lang;
      this.updateDisplayTitle();
      this.translateProjectDescriptions();
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.loadCategories();
    this.loadRatings();
    this.loadArticles();
    this.updateBrokeredChunking();
    this.updateArticlesChunking();
    window.addEventListener('resize', this.updateBrokeredChunking.bind(this));
    window.addEventListener('resize', this.updateArticlesChunking.bind(this));
  }

  ngAfterViewInit() {
    this.typeWriter(0);
    this.initializeCarousel();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateBrokeredChunking.bind(this));
    window.removeEventListener('resize', this.updateArticlesChunking.bind(this));
  }

  private initializeCarousel() {
    const carousel = document.getElementById('feedbackCarousel');
    if (carousel) {
      new bootstrap.Carousel(carousel, {
        interval: 3000,
        wrap: true,
        touch: true,
        slide: 'single'
      });
    }
  }

  loadProjects() {
    this.homeService.getHomeProjects().subscribe({
      next: (projects) => {
        // Filter for launched projects only
        const launchedProjects = projects.filter(project => project.projectType === 'launched');
        this.projects = launchedProjects;
        this.originalProjects = [...launchedProjects];
        this.filteredProjects = launchedProjects.slice(0, 20);
        this.showResults = false;
        this.noProjectsAvailable = false;
        this.updateDisplayTitle();
      },
      error: (err) => {
        console.error('Failed to fetch projects:', err);
        this.projects = [];
        this.filteredProjects = [];
        this.noProjectsAvailable = true;
      }
    });
  }

  private translateProjectDescriptions() {
    if (this.currentLang === 'en') {
      this.projects = [...this.originalProjects];
      this.applyFilters(); // Reapply filters after language change
      return;
    }

    this.translationService.translateProjectDescriptions(this.originalProjects, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            this.projects = this.originalProjects.map((project, index) => ({
              ...project,
              description: response[index] || project.description
            }));
          } else {
            this.projects = [...this.originalProjects];
          }
          this.applyFilters(); // Reapply filters after translation
        },
        error: (err) => {
          console.error('Translation error:', err);
          this.projects = [...this.originalProjects];
          this.applyFilters(); // Reapply filters even after error
        }
      });
  }

  typeWriter(index: number) {
    const typedText = document.getElementById("typed-text");
    if (typedText && index < this.text.length) {
      typedText.innerHTML += this.text.charAt(index);
      setTimeout(() => this.typeWriter(index + 1), this.speed);
    } else {
      document.querySelector(".cursor")?.classList.add("hidden");
    }
  }

  selectOption(option: string) {
    this.selectedOption = option;
    
    // Reset purpose filter based on selected option
    if (option === 'all') {
      this.searchCriteria.purpose = '';
      this.filteredProjects = this.projects.slice(0, 20);
      this.showResults = true;
    } else if (option === 'investing') {
      this.searchCriteria.purpose = 'invest';
      this.applyFilters();
    } else if (option === 'buying') {
      // For buying, we'll show both 'buy with ownership' and 'buy without ownership'
      this.searchCriteria.purpose = 'buy with ownership';
      this.applyFilters();
    }
    
    this.updateDisplayTitle();
  }

  getAnalyticsUrl(projectId: string): string {
    return `${this.clientUrl}/dashboard/analytics/${projectId}`;
  }

  searchProjects() {
    this.applyFilters();
  }

  /**
   * The main filtering function that applies all search criteria
   */
  private applyFilters() {
    // Start with all launched projects
    let filtered = [...this.projects];

    // Filter by category if specified
    if (this.searchCriteria.category) {
      filtered = filtered.filter(project => 
        project.category === this.searchCriteria.category);
    }

    // Filter by financial category if specified and status is not pending
    if (this.searchCriteria.financialCategory) {
      filtered = filtered.filter(project => 
        project.status !== 'pending' && 
        project.financialCategory === this.searchCriteria.financialCategory);
    }

    // Filter by owner (case insensitive partial match)
    if (this.searchCriteria.owner) {
      const ownerSearch = this.searchCriteria.owner.toLowerCase().trim();
      filtered = filtered.filter(project => 
        project.owner.toLowerCase().includes(ownerSearch));
    }

    // Filter by purpose (case insensitive)
    if (this.searchCriteria.purpose) {
      const purposeLower = this.searchCriteria.purpose.toLowerCase();
      if (purposeLower === 'invest') {
        // For 'invest', match exactly (case insensitive)
        filtered = filtered.filter(project => 
          project.purpose?.toLowerCase() === 'invest');
      } else if (purposeLower === 'buy with ownership') {
        // For buying, include both 'buy with ownership' and 'buy without ownership' (case insensitive)
        filtered = filtered.filter(project => 
          project.purpose?.toLowerCase() === 'buy with ownership' || 
          project.purpose?.toLowerCase() === 'buy without ownership');
      }
    }

    // Update filtered projects (limit to 20 for display)
    this.filteredProjects = filtered.slice(0, 20);
    
    // Update UI state
    this.showResults = true;
    this.noProjectsAvailable = this.filteredProjects.length === 0;
    this.updateDisplayTitle();
  }

  clearSearch() {
    // Reset search criteria with default purpose based on selected option
    this.searchCriteria = {
      category: '',
      financialCategory: '',
      businessField: '',
      location: '',
      purpose: this.selectedOption === 'buying' ? 'buy' : 
               this.selectedOption === 'investing' ? 'invest' : '',
      owner: '',
      feasibilityLocation: '',
      projectType: ''
    };
    
    // Reset to show all projects (limited to 20)
    this.filteredProjects = this.projects.slice(0, 20);
    this.showResults = false;
    this.noProjectsAvailable = false;
    this.updateDisplayTitle();
  }

  onOwnerInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchCriteria.owner = input.value;
    this.applyFilters();
  }

  // Method to update displayTitle based on the current state
  updateDisplayTitle() {
    if (this.showResults && this.filteredProjects.length > 0) {
      this.translate.get('DISPLAY_TITLE_FILTERED').subscribe((res: string) => {
        this.displayTitle = res;
      });
    } else {
      this.translate.get('DISPLAY_TITLE_ALL').subscribe((res: string) => {
        this.displayTitle = res;
      });
    }
  }

  // Method to chunk array into groups of specified size
  public chunkArray(array: any[], size: number): any[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
  }

  // Responsive chunking for brokered projects
  updateBrokeredChunking() {
    let chunkSize = 4;
    const width = window.innerWidth;
    if (width <= 912) {
      chunkSize = 1;
    } else if (width <= 992) {
      chunkSize = 2;
    } else if (width <= 1200) {
      chunkSize = 3;
    }
    this.groupedBrokeredProjects = this.chunkArray(this.brokeredProjects, chunkSize);
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

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('★'); // filled star
      } else {
        stars.push('☆'); // empty star
      }
    }
    return stars;
  }

  // Method for joining community projects
 

  loadCategories() {
    this.homeService.getUniqueCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
        this.categories = [];
      }
    });
  }

  loadRatings() {
    this.homeService.getRatings().subscribe({
      next: (ratings) => {
        this.feedbacks = ratings;
        this.feedbackChunks = this.chunkArray(this.feedbacks, 3);
      },
      error: (err) => {
        console.error('Failed to fetch ratings:', err);
        this.feedbacks = [];
        this.feedbackChunks = [];
      }
    });
  }



  bookmarkProject(projectId: string): void {
    // Open the client bookmarking component in a new tab
    const bookmarkUrl = `${this.clientUrl}/dashboard/bookmarking/${projectId}`;
    window.open(bookmarkUrl, '_blank');
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

  openArticle(url: string) {
    // Use Angular router navigation for internal links
    // If you want to open in a new tab, use window.open(url, '_blank');
    // Here, we use router navigation for consistency
    // You may need to inject Router if not already
    // (already imported in the community projects component)
    // For now, fallback to window.open for external links
    if (url.startsWith('/')) {
      // Internal route
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }
}