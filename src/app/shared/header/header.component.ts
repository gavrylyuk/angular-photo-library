import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  isActive,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  readonly isPhotoDetail = isActive('/photos', this.router);
}
