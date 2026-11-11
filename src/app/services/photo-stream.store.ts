import { DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PHOTO_BATCH_SIZE } from '@app/constants/photo-stream.constants';
import { PhotoService } from './photo.service';
import { Photo } from '@app/models/photo';

@Service()
export class PhotoStreamStore {
  private readonly photoService = inject(PhotoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photoState = signal<Photo[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal(false);

  private initialLoadStarted = false;

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
      .getRandomPhotos(PHOTO_BATCH_SIZE)
      // Cancel an active request if the store is destroyed.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photos) => {
          if (photos.length === 0) {
            this.errorState.set(true);
          } else {
            this.photoState.update((current) => [...current, ...photos]);
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
