import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectLaunchComponent } from './initiating-project/project-launch/project-launch.component';

export interface Project {
  projectId: string;
  projectName: string;
  description: string;
  submittedOn: string;
  updatedOn: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  category?: string;
  projectLocation?: string;
  projectPhotoUrl?: string;
  projectThumbnailUrl?: string;
  businessIdea?: string;
  businessPlanUrl?: string;
  businessIdeaDocumentUrl?: string;
  balanceSheetUrl?: string;
  cashFlowUrl?: string;
  incomeStatementUrl?: string;
  pitchingVideoUrl?: string;
  professionalStatus?: string;
  haveSponsorQ?: string;
  projectPurpose?: string;
  doSellProjectQ?: string;
  projectAmount?: number;
  needOrgQ?: string;
  sponsorName?: string;
  website?: string;
  prototypeLink?: string;
  projectStatus?: string;
  linkedIn?: string;
  monthlyIncome?: number;
  specialityOfProject?: string;
  phone?: string;
  needSponsorQ?: string;
  numberOfEmp?: number;
  wantOriginToBusinessPlanQ?: string;
  intellectualProjectQ?: string;
  email?: string;
  feedback?: string;
  clientName?: string;
  documentThumbnails?: {
    incomeStatement?: string;
    cashFlowStatement?: string;
    balanceSheet?: string;
    pitchingVideo?: string;
    businessPlan?: string;
    businessIdeaDocument?: string;
  };
}

@NgModule({
  declarations: [
    // ... other components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ProjectLaunchComponent,
  ]
})
export class ProjectModule { }
