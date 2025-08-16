import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyzerService } from '../../../services/analyzer.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

interface Project {
  id: number;
  details: any[];
  isAssigned: boolean;
  assignedAnalyzerName?: string;
  analytics: string; // URL to the analytics PDF document
  category: string;
  location: string;
  speciality: string;
  professionalStatus: string;
  email: string;
  phone: string;
  linkedin: string;
  projectStatus: 'Approved' | 'Declined' | 'Pending';
  prototypeLink: string;
  employeesCount: number;
  monthlyIncome: number;
  websiteUrl: string;
  hasSponsorship: string;
  sponsorName: string;
  needsSponsor: string;
  originSponsorship: string; // Fixed typo in 'origin'
  sellProject: string;
  projectInvestment: number;
  incomeStatement: string;
  cashFlowStatement: string;
  balanceSheet: string;
  pitchingVideo: string;
  businessPlan: string;
  businessIdeaDocument: string;
  businessIdea: string;
  projectType: string;
  launchDetails: any;
  orderDetails: any;
  communityDetails: any;
  fullName: string;
  documentThumbnails: any;
  thumbnail: string;
  declinedFeedback?: string;
  declinedBy?: string;
  declinedDate?: Date;
  assignedAnalyzers?: Array<{
    id: number;
    name: string;
    expertise: string;
    assignedDate: Date;
  }>;
  description: string;
  purpose: 'Invest' | 'Buy with ownership' | 'Buy without ownership';
  needsBusinessPlan: string;
  projectName: string;
  wantsIP: string;
}

@Component({
  selector: 'app-launched-project-details',
  templateUrl: './launched-project-details.component.html',
  styleUrls: ['./launched-project-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    CustomButtonComponent
  ]
})
export class LaunchedProjectDetailsComponent implements OnInit {
  projectId!: number;
  project!: Project;
  analyzers: any[] = [];
  selectedAnalyzer: any;
  dummyProjects: Project[] = [];

  constructor(
    private route: ActivatedRoute,
    private analyzerService: AnalyzerService
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.initializeDummyData();
    this.loadProjectDetails();
    this.loadAnalyzers();
  }

  initializeDummyData(): void {
    this.dummyProjects = [
      {
        id: 1,
        // Personal Information
        fullName: 'AI Chatbot Platform Inc.',
        professionalStatus: 'Established',
        email: 'contact@aichatbot.com',
        phone: '+1-555-123-4567',
        linkedin: 'https://linkedin.com/company/aichatbot',

        // Project Information
        thumbnail: 'assets/images/project-thumbnails/ai-chatbot.png',
        projectName: 'AI Customer Service Platform',
        description: 'An advanced AI-powered chatbot platform that leverages machine learning to provide human-like customer service interactions. Our solution integrates with existing CRM systems and can handle multiple languages.',
        category: 'Technology',
        location: 'San Francisco, CA',
        projectStatus: 'Approved', // status: Idea, Prototype, Operating
        prototypeLink: 'https://example.com/prototype',
        employeesCount: 5,
        monthlyIncome: 10000,
        websiteUrl: 'https://aichatbot.com',
        incomeStatement: 'https://example.com/income-statement.pdf',
        cashFlowStatement: 'https://example.com/cash-flow.pdf',
        balanceSheet: 'https://example.com/balance-sheet.pdf',
        speciality: 'AI and Machine Learning',
        pitchingVideo: 'https://example.com/pitch-video.mp4',
        purpose: 'Invest',

        // Sponsorship Information
        hasSponsorship: 'Yes',
        sponsorName: 'Tech Innovators Inc.',
        needsSponsor: 'No',
        originSponsorship: 'Tech Sector',
        sellProject: 'Yes',
        projectInvestment: 50000,

        // Intellectual Property
        wantsIP: 'Yes',
        businessPlan: 'https://example.com/business-plan.pdf',
        needsBusinessPlan: 'No',
        businessIdea: 'A comprehensive AI chatbot platform for enterprise customer service.',
        businessIdeaDocument: 'https://example.com/idea-doc.pdf',

        // Additional System Fields
        projectType: 'launch',
        isAssigned: true,
        assignedAnalyzerName: 'John Doe',
        analytics: 'https://example.com/analytics.pdf',
        documentThumbnails: {
          incomeStatement: 'assets/images/doc-thumbnails/income.png',
          cashFlowStatement: 'assets/images/doc-thumbnails/cashflow.png',
          balanceSheet: 'assets/images/doc-thumbnails/balance.png',
          pitchingVideo: 'assets/images/doc-thumbnails/video.png',
          businessPlan: 'assets/images/doc-thumbnails/plan.png',
          businessIdeaDocument: 'assets/images/doc-thumbnails/idea.png'
        },
        details: [],
        launchDetails: {},
        orderDetails: {},
        communityDetails: {}
      },
      {
        id: 2,
        // Personal Information
        fullName: 'EcoPack Solutions Inc.',
        professionalStatus: 'Startup',
        email: 'info@ecopack.com',
        phone: '+1-555-987-6543',
        linkedin: 'https://linkedin.com/company/ecopack',

        // Project Information
        thumbnail: 'assets/images/project-thumbnails/eco-packaging.png',
        projectName: 'Eco-Friendly Packaging',
        description: 'Revolutionary biodegradable packaging solution made from agricultural waste. Our products decompose completely within 180 days while maintaining the same durability as traditional packaging.',
        category: 'Sustainability',
        location: 'New York, NY',
        projectStatus: 'Declined',
        prototypeLink: 'https://example.com/eco-packaging',
        employeesCount: 8,
        monthlyIncome: 15000,
        websiteUrl: 'https://ecopack.com',
        incomeStatement: 'https://example.com/eco-income.pdf',
        cashFlowStatement: 'https://example.com/eco-cashflow.pdf',
        balanceSheet: 'https://example.com/eco-balance.pdf',
        speciality: 'Environmental Science',
        pitchingVideo: 'https://example.com/eco-pitch.mp4',
        purpose: 'Buy with ownership',

        // Sponsorship Information
        hasSponsorship: 'No',
        sponsorName: '',
        needsSponsor: 'Yes',
        originSponsorship: '',
        sellProject: 'No',
        projectInvestment: 0,

        // Intellectual Property
        wantsIP: 'Yes',
        businessPlan: 'https://example.com/eco-plan.pdf',
        needsBusinessPlan: 'Yes',
        businessIdea: 'Innovative eco-friendly packaging materials for sustainable businesses',
        businessIdeaDocument: 'https://example.com/eco-idea.pdf',

        // Additional System Fields
        projectType: 'launch',
        isAssigned: false,
        declinedFeedback: 'The project lacks sufficient market validation and the financial projections are not realistic. The team needs more experience in the packaging industry.',
        declinedBy: 'Sarah Thompson',
        declinedDate: new Date('2024-03-15'),
        documentThumbnails: {
          incomeStatement: 'assets/images/doc-thumbnails/income.png',
          cashFlowStatement: 'assets/images/doc-thumbnails/cashflow.png',
          balanceSheet: 'assets/images/doc-thumbnails/balance.png',
          pitchingVideo: 'assets/images/doc-thumbnails/video.png',
          businessPlan: 'assets/images/doc-thumbnails/plan.png',
          businessIdeaDocument: 'assets/images/doc-thumbnails/idea.png'
        },
        details: [],
        analytics: '',
        launchDetails: {},
        orderDetails: {},
        communityDetails: {}
      },
      {
        id: 3,
        // Personal Information
        fullName: 'Smart Home Technologies Inc.',
        professionalStatus: 'Growth Stage',
        email: 'contact@smarthome.tech',
        phone: '+1-555-789-0123',
        linkedin: 'https://linkedin.com/company/smart-home-tech',

        // Project Information
        thumbnail: 'assets/images/project-thumbnails/smart-home.png',
        projectName: 'Smart Home System',
        description: 'Next-generation smart home system that integrates AI with IoT devices to create a truly automated living experience. Features include predictive maintenance, energy optimization, and advanced security.',
        category: 'IoT',
        location: 'Austin, TX',
        projectStatus: 'Pending',
        prototypeLink: 'https://example.com/smart-home-demo',
        employeesCount: 12,
        monthlyIncome: 25000,
        websiteUrl: 'https://smarthome.tech',
        incomeStatement: 'https://example.com/smart-income.pdf',
        cashFlowStatement: 'https://example.com/smart-cashflow.pdf',
        balanceSheet: 'https://example.com/smart-balance.pdf',
        speciality: 'Smart Home Technology',
        pitchingVideo: 'https://example.com/smart-pitch.mp4',
        purpose: 'Buy without ownership',

        // Sponsorship Information
        hasSponsorship: 'Yes',
        sponsorName: 'Smart Tech Solutions',
        needsSponsor: 'No',
        originSponsorship: 'Technology Sector',
        sellProject: 'No',
        projectInvestment: 0,

        // Intellectual Property
        wantsIP: 'Yes',
        businessPlan: 'https://example.com/smart-plan.pdf',
        needsBusinessPlan: 'No',
        businessIdea: 'Comprehensive IoT-based home automation system',
        businessIdeaDocument: 'https://example.com/smart-idea.pdf',

        // Additional System Fields
        projectType: 'launch',
        isAssigned: true,
        assignedAnalyzerName: 'Jane Smith',
        assignedAnalyzers: [
          {
            id: 1,
            name: 'John Doe',
            expertise: 'AI & Machine Learning',
            assignedDate: new Date('2024-02-01')
          },
          {
            id: 2,
            name: 'Jane Smith',
            expertise: 'Data Analytics',
            assignedDate: new Date('2024-02-02')
          },
          {
            id: 3,
            name: 'Michael Johnson',
            expertise: 'Software Architecture',
            assignedDate: new Date('2024-02-03')
          }
        ],
        documentThumbnails: {
          incomeStatement: 'assets/images/doc-thumbnails/income.png',
          cashFlowStatement: 'assets/images/doc-thumbnails/cashflow.png',
          balanceSheet: 'assets/images/doc-thumbnails/balance.png',
          pitchingVideo: 'assets/images/doc-thumbnails/video.png',
          businessPlan: 'assets/images/doc-thumbnails/plan.png',
          businessIdeaDocument: 'assets/images/doc-thumbnails/idea.png'
        },
        details: [],
        analytics: '',
        launchDetails: {},
        orderDetails: {},
        communityDetails: {}
      }
    ];
  }

  loadProjectDetails(): void {
    const foundProject = this.dummyProjects.find(p => p.id === this.projectId);
    if (foundProject) {
      this.project = foundProject;
    } else {
      // Handle project not found case
      console.error('Project not found');
    }
  }

  loadAnalyzers(): void {
    // Dummy analyzers data
    this.analyzers = [
      { id: 1, name: 'John Doe', expertise: 'AI & Machine Learning' },
      { id: 2, name: 'Jane Smith', expertise: 'Data Analytics' },
      { id: 3, name: 'Michael Johnson', expertise: 'Software Architecture' },
      { id: 4, name: 'Emily Davis', expertise: 'Cloud Computing' },
      { id: 5, name: 'David Wilson', expertise: 'Cybersecurity' }
    ];
  }

  assignProject(): void {
    if (this.selectedAnalyzer) {
      this.project.isAssigned = true;
      this.project.assignedAnalyzerName = this.selectedAnalyzer.name;
      console.log(`Project assigned to: ${this.selectedAnalyzer.name}`);
    }
  }
}
