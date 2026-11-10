import {
  afterRenderEffect,
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PhotoStreamStore } from '../../services/photo-stream.store';
import { MatButtonModule } from '@angular/material/button';
import { photoThumbnailUrl } from '../../utils/photo-thumbnail-url';

@Component({
  selector: 'app-photos',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  styleUrl: './photos.component.scss',
  templateUrl: './photos.component.html',
})
export class PhotosComponent implements OnInit, AfterViewInit {
  readonly store = inject(PhotoStreamStore);

  readonly supportsInfiniteScroll = typeof IntersectionObserver !== 'undefined';

  readonly photoThumbnailUrl = photoThumbnailUrl;

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
