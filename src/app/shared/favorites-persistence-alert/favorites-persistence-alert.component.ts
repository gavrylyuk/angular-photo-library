import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesStore } from '@app/services/favorites.store';

@Component({
  selector: 'app-favorites-persistence-alert',
  imports: [MatButtonModule],
  templateUrl: './favorites-persistence-alert.component.html',
  styleUrl: './favorites-persistence-alert.component.scss',
})
export class FavoritesPersistenceAlertComponent {
  readonly favorites = inject(FavoritesStore);
}
