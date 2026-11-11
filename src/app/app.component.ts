import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FavoritesPersistenceAlertComponent } from './shared/favorites-persistence-alert/favorites-persistence-alert.component';
import { FavoritesStore } from './services/favorites.store';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FavoritesPersistenceAlertComponent,
    MatButtonModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly favorites = inject(FavoritesStore);
}
