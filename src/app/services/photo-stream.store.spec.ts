import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PHOTO_BATCH_SIZE } from '@app/constants/photo-stream.constants';
import { Photo } from '@app/models/photo';
import { PhotoService } from './photo.service';
import { PhotoStreamStore } from './photo-stream.store';

const FIRST_PHOTO: Photo = {
  id: '1',
  author: 'First photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/1',
  download_url: 'https://picsum.photos/id/1/500/300',
};

const SECOND_PHOTO: Photo = {
  id: '2',
  author: 'Second photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/2',
  download_url: 'https://picsum.photos/id/2/500/300',
};

describe('PhotoStreamStore', () => {
  let photos$: Subject<Photo[]>;

  const photoService = {
    getRandomPhotos: vi.fn(),
  };

  beforeEach(() => {
    photos$ = new Subject<Photo[]>();

    photoService.getRandomPhotos.mockReset();
    photoService.getRandomPhotos.mockReturnValue(photos$.asObservable());

    TestBed.configureTestingModule({
      providers: [{ provide: PhotoService, useValue: photoService }],
    });
  });

  it('loads and stores a random batch', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();

    expect(photoService.getRandomPhotos).toHaveBeenCalledWith(PHOTO_BATCH_SIZE);
    expect(store.loading()).toBe(true);

    photos$.next([FIRST_PHOTO]);

    expect(store.photos()).toEqual([FIRST_PHOTO]);
    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  it('does not start another request while loading', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    store.loadMore();

    expect(photoService.getRandomPhotos).toHaveBeenCalledTimes(1);
  });

  it('appends the next batch to the existing photos', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    photos$.next([FIRST_PHOTO]);

    const nextPhotos$ = new Subject<Photo[]>();
    photoService.getRandomPhotos.mockReturnValue(nextPhotos$.asObservable());

    store.loadMore();

    expect(photoService.getRandomPhotos).toHaveBeenCalledTimes(2);
    expect(photoService.getRandomPhotos).toHaveBeenLastCalledWith(
      PHOTO_BATCH_SIZE,
    );

    nextPhotos$.next([SECOND_PHOTO]);

    expect(store.photos()).toEqual([FIRST_PHOTO, SECOND_PHOTO]);
  });

  it('reports an error and retries the batch', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    photos$.error(new Error('Request failed'));

    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(true);

    const retryPhotos$ = new Subject<Photo[]>();
    photoService.getRandomPhotos.mockReturnValue(retryPhotos$.asObservable());

    store.loadMore();

    expect(store.hasError()).toBe(false);
    expect(store.loading()).toBe(true);
    expect(photoService.getRandomPhotos).toHaveBeenCalledTimes(2);
    expect(photoService.getRandomPhotos).toHaveBeenLastCalledWith(
      PHOTO_BATCH_SIZE,
    );

    retryPhotos$.next([FIRST_PHOTO]);

    expect(store.photos()).toEqual([FIRST_PHOTO]);
    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  it('starts the initial load only once', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.ensureLoaded();
    photos$.next([FIRST_PHOTO]);

    store.ensureLoaded();

    expect(photoService.getRandomPhotos).toHaveBeenCalledTimes(1);
  });

  it('reports an error when a batch is empty', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    photos$.next([]);

    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(true);
    expect(store.photos()).toEqual([]);
  });
});
