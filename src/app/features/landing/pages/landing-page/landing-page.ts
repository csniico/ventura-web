import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import section components
import { HeroSectionComponent } from '../../hero-section.component';
import { FeaturesSectionComponent } from '../../features-section.component';
import { HowItWorksSectionComponent } from '../../how-it-works-section.component';
import { CtaSectionComponent } from '../../cta-section.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    CommonModule,
    HeroSectionComponent,
    FeaturesSectionComponent,
    HowItWorksSectionComponent,
    CtaSectionComponent
  ],
  templateUrl: './landing-page.html',
})
export class LandingPage {}
