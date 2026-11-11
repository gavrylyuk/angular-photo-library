import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { PhotosComponent } from './photos.component';
import { PhotoService } from '../../services/photo.service';
import { PHOTO_BATCH_SIZE } from '../../services/photo-stream.constants';
import { FavoritesStore } from '../../services/favorites.store';
import { Photo } from '../../models/photo';
import { signal } from '@angular/core';

const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('PhotosComponent', () => {
  let photos$: Subject<Photo[]>;
  const photoService = {
    getPhotos: vi.fn(),
  };

  beforeEach(() => {
    photos$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReset();
    photoService.getPhotos.mockReturnValue(photos$.asObservable());

    TestBed.configureTestingModule({
      imports: [PhotosComponent],
      providers: [{ provide: PhotoService, useValue: photoService }],
    });
  });

  it('requests the first batch when displayed', () => {
    const fixture = TestBed.createComponent(PhotosComponent);

    fixture.detectChanges();

    expect(photoService.getPhotos).toHaveBeenCalledWith(1, PHOTO_BATCH_SIZE);
  });

  it('displays photos returned by the service', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    photos$.next([TEST_PHOTO]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');
    const button = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Add photo by Example photographer to favorites"]',
    );

    expect(image?.getAttribute('src')).toBe(PHOTO_URL);
    expect(image?.getAttribute('alt')).toBe('');
    expect(button).not.toBeNull();
  });

  it('shows a loading indicator until photos arrive', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="status"]')).not.toBeNull();

    photos$.next([]);
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('shows an error and stops loading when the request fails', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    photos$.error(new Error('Request failed'));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to load photos',
    );
  });

  it('retries loading photos after a failure', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    photos$.error(new Error('Request failed'));
    fixture.detectChanges();

    const retryPhotos$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReturnValue(retryPhotos$.asObservable());

    const element = fixture.nativeElement as HTMLElement;
    const retryButton = element.querySelector('button');

    expect(retryButton).not.toBeNull();
    retryButton?.click();
    fixture.detectChanges();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(2);
    expect(photoService.getPhotos).toHaveBeenCalledWith(1, PHOTO_BATCH_SIZE);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('[role="status"]')).not.toBeNull();

    retryPhotos$.next([]);
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('requests the next page when Load more is selected', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    try {
      const fixture = TestBed.createComponent(PhotosComponent);
      fixture.detectChanges();

      photos$.next([TEST_PHOTO]);
      fixture.detectChanges();

      const nextPhotos$ = new Subject<Photo[]>();
      photoService.getPhotos.mockReturnValue(nextPhotos$.asObservable());

      const element = fixture.nativeElement as HTMLElement;
      const button = Array.from(element.querySelectorAll('button')).find((b) =>
        b.textContent?.toLowerCase().includes('load more'),
      );

      expect(button).toBeDefined();
      button?.click();

      expect(photoService.getPhotos).toHaveBeenCalledTimes(2);
      expect(photoService.getPhotos).toHaveBeenCalledWith(2, PHOTO_BATCH_SIZE);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('hides Load more when automatic scrolling is available', () => {
    const observer = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function () {
        return observer;
      }),
    );

    try {
      const fixture = TestBed.createComponent(PhotosComponent);
      fixture.detectChanges();

      photos$.next([TEST_PHOTO]);
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      const loadMore = Array.from(element.querySelectorAll('button')).find(
        (button) => button.textContent?.includes('Load more'),
      );

      expect(loadMore).toBeUndefined();

      fixture.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('loads the next page when the sentinel becomes visible', () => {
    let observerCallback: IntersectionObserverCallback | undefined;

    const observer = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (callback: IntersectionObserverCallback) {
        observerCallback = callback;
        return observer;
      }),
    );

    try {
      const fixture = TestBed.createComponent(PhotosComponent);
      fixture.detectChanges();

      // Complete the first batch before simulating another intersection.
      photos$.next([TEST_PHOTO]);
      fixture.detectChanges();

      const nextPhotos$ = new Subject<Photo[]>();
      photoService.getPhotos.mockReturnValue(nextPhotos$.asObservable());

      const entry = { isIntersecting: true } as IntersectionObserverEntry;

      expect(observerCallback).toBeDefined();
      observerCallback?.([entry], observer as unknown as IntersectionObserver);

      expect(photoService.getPhotos).toHaveBeenLastCalledWith(
        2,
        PHOTO_BATCH_SIZE,
      );

      fixture.destroy();
      expect(observer.disconnect).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('rechecks the sentinel after photos render', async () => {
    const observer = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function () {
        return observer;
      }),
    );

    try {
      const fixture = TestBed.createComponent(PhotosComponent);
      fixture.detectChanges();

      expect(observer.observe).toHaveBeenCalledTimes(1);

      photos$.next([TEST_PHOTO]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(observer.unobserve).toHaveBeenCalled();
      expect(observer.observe).toHaveBeenCalledTimes(2);

      fixture.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('adds a selected photo to favorites', () => {
    const add = vi.fn();

    TestBed.overrideProvider(FavoritesStore, {
      useValue: {
        add,
        photos: signal([]),
      },
    });

    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    photos$.next([TEST_PHOTO]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Add photo by Example photographer to favorites"]',
    );

    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(false);

    button?.click();

    expect(add).toHaveBeenCalledWith(TEST_PHOTO);
  });

  it('marks a photo as saved after selecting it', () => {
    const savedPhotos = signal<Photo[]>([]);

    TestBed.overrideProvider(FavoritesStore, {
      useValue: {
        photos: savedPhotos,
        add: (photo: Photo) =>
          savedPhotos.update((photos) => [...photos, photo]),
      },
    });

    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.detectChanges();

    photos$.next([TEST_PHOTO]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Add photo by Example photographer to favorites"]',
    );

    expect(button).not.toBeNull();

    button?.click();
    fixture.detectChanges();

    expect(button?.getAttribute('aria-label')).toBe(
      'Photo by Example photographer is already in favorites',
    );
    expect(button?.querySelector('.favorite-badge')?.textContent).toContain(
      'Saved',
    );
  });
});
