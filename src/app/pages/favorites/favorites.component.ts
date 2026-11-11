import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PhotoGridComponent } from '@app/shared/photo-grid/photo-grid.component';
import { FavoritesStore } from '@app/services/favorites.store';

@Component({
  imports: [MatButtonModule, PhotoGridComponent, RouterLink],
  selector: 'app-favorites',
  styleUrl: './favorites.component.scss',
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  readonly favorites = inject(FavoritesStore);
}
