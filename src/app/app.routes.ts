import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/photos/photos.component').then((m) => m.PhotosComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: 'photo/:id',
    loadComponent: () =>
      import('./pages/photo-detail/photo-detail.component').then(
        (m) => m.PhotoDetailComponent,
      ),
  },
];
