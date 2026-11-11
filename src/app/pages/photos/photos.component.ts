import {
  afterRenderEffect,
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { PhotoGridComponent } from '@app/shared/photo-grid/photo-grid.component';
import { PhotoStreamStore } from '@app/services/photo-stream.store';
import { FavoritesStore } from '@app/services/favorites.store';

@Component({
  selector: 'app-photos',
  imports: [PhotoGridComponent, MatButtonModule, MatProgressSpinnerModule],
  styleUrl: './photos.component.scss',
  templateUrl: './photos.component.html',
})
export class PhotosComponent implements OnInit, AfterViewInit {
  readonly store = inject(PhotoStreamStore);
  readonly favorites = inject(FavoritesStore);
  readonly favoriteIds = computed(
    () => new Set(this.favorites.photos().map((photo) => photo.id)),
  );

  readonly supportsInfiniteScroll = typeof IntersectionObserver !== 'undefined';

  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollSentinel =
    viewChild.required<ElementRef<HTMLElement>>('scrollSentinel');

  private observer?: IntersectionObserver;

  private readonly recheckSentinel = afterRenderEffect(() => {
    const observer = this.observer;

    if (this.store.loading() || this.store.hasError() || !observer) {
      return;
    }

    const sentinel = this.scrollSentinel().nativeElement;
    observer.unobserve(sentinel);
    observer.observe(sentinel);
  });

  ngOnInit(): void {
    this.store.ensureLoaded();
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !this.store.hasError()) {
        this.store.loadMore();
      }
    });

    this.observer = observer;
    observer.observe(this.scrollSentinel().nativeElement);

    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
