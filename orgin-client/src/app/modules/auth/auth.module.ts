import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RouterModule } from '@angular/router'; // ✅ Ensure routing works

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ Add this to use formGroup
    RouterModule, // ✅ Ensure routes work
    LoginComponent, 
    SignupComponent
  ]
})
export class AuthModule { }
