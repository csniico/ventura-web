import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './landing-layout.html',
})
export class LandingLayout {}
