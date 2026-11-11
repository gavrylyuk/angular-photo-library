import { Service, signal } from '@angular/core';
import { Photo } from '../models/photo';
import { readFavorites, saveFavorites } from '../utils/favorites-storage';

@Service()
export class FavoritesStore {
  private readonly photoState = signal<Photo[]>(readFavorites());
  private readonly persistenceErrorState = signal(false);
  private persist(): void {
    try {
      saveFavorites(this.photos());
      this.persistenceErrorState.set(false);
    } catch {
      this.persistenceErrorState.set(true);
    }
  }

  readonly photos = this.photoState.asReadonly();
  readonly persistenceError = this.persistenceErrorState.asReadonly();

  add(photo: Photo): void {
    if (this.photos().some((favorite) => favorite.id === photo.id)) {
      return;
    }

    this.photoState.update((photos: Photo[]) => [...photos, photo]);
    this.persist();
  }

  remove(id: string): void {
    if (!this.photos().some((photo) => photo.id === id)) {
      return;
    }

    this.photoState.update((photos) =>
      photos.filter((photo) => photo.id !== id),
    );
    this.persist();
  }

  retryPersistence(): void {
    this.persist();
  }
}
