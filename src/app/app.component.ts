import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  isActive,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FavoritesStore } from './services/favorites.store';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly isPhotoDetail = isActive('/photos', this.router);
  readonly favorites = inject(FavoritesStore);
}
