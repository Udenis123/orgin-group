import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
     
    // other components
  ],
  imports: [
    NavbarComponent,
    CommonModule, // Required for ngIf
    RouterModule, // Import RouterModule for routerLinkActiveOptions
    // other modules
  ],
  exports: [NavbarComponent]
})
export class SharedModule { }
