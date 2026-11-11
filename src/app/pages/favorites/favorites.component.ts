import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesStore } from '../../services/favorites.store';
import { PhotoGridComponent } from '../../shared/photo-grid/photo-grid.component';

@Component({
  imports: [MatButtonModule, PhotoGridComponent, RouterLink],
  selector: 'app-favorites',
  styleUrl: './favorites.component.scss',
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  readonly favorites = inject(FavoritesStore);
}
