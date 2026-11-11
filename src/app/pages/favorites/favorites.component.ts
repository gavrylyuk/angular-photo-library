import { Component, inject } from '@angular/core';
import { FavoritesStore } from '../../services/favorites.store';
import { PhotoGridComponent } from '../../shared/photo-grid/photo-grid.component';

@Component({
  imports: [PhotoGridComponent],
  selector: 'app-favorites',
  styleUrl: './favorites.component.scss',
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  readonly favorites = inject(FavoritesStore);
}
