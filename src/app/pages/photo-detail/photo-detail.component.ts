import { Component, computed, inject, linkedSignal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { ImageLoadState } from '@app/models/image-load-state';
import { FavoritesStore } from '@app/services/favorites.store';

@Component({
  selector: 'app-photo-detail',
  imports: [MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly favorites = inject(FavoritesStore);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });
  private readonly router = inject(Router);

  removeFromFavorites(): void {
    const selectedPhoto = this.photo();

    if (!selectedPhoto) {
      return;
    }

    this.favorites.remove(selectedPhoto.id);
    void this.router.navigate(['/favorites']);
  }

  readonly photo = computed(() => {
    const id = this.params().get('id');
    return this.favorites.photos().find((favorite) => favorite.id === id);
  });

  readonly imageState = linkedSignal({
    source: () => this.photo()?.id,
    computation: (): ImageLoadState => 'loading',
  });
}
