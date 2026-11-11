import { DestroyRef, inject, Service, signal } from '@angular/core';
import { Photo } from '../models/photo';
import { PhotoService } from './photo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PHOTO_BATCH_SIZE } from './photo-stream.constants';
import { shufflePhotos } from '@app/utils/shuffle-photos';

@Service()
export class PhotoStreamStore {
  private readonly photoService = inject(PhotoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photoState = signal<Photo[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal(false);

  private initialLoadStarted = false;
  private nextPage = 1;

  readonly photos = this.photoState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly hasError = this.errorState.asReadonly();

  loadMore(): void {
    if (this.loading()) {
      return;
    }

    this.errorState.set(false);
    this.loadingState.set(true);

    this.photoService
      .getPhotos(this.nextPage, PHOTO_BATCH_SIZE)
      // Cancel an active request if the store is destroyed.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photos: Photo[]) => {
          if (photos.length === 0) {
            if (this.nextPage === 1) {
              this.errorState.set(true);
            }

            this.nextPage = 1;
          } else {
            this.photoState.update((current: Photo[]) => [
              ...current,
              ...shufflePhotos(photos),
            ]);
            this.nextPage += 1;
          }
          this.loadingState.set(false);
        },
        error: () => {
          this.errorState.set(true);
          this.loadingState.set(false);
        },
      });
  }

  ensureLoaded(): void {
    if (this.initialLoadStarted) {
      return;
    }

    this.initialLoadStarted = true;
    this.loadMore();
  }
}
