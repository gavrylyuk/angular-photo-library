import { TestBed } from '@angular/core/testing';
import { PhotoStreamStore } from './photo-stream.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { Photo } from '../models/photo';
import { PhotoService } from './photo.service';
import { PHOTO_BATCH_SIZE } from './photo-stream.constants';

describe('PhotoStreamStore', () => {
  let photos$: Subject<Photo[]>;

  const photoService = {
    getPhotos: vi.fn(),
  };

  beforeEach(() => {
    photos$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReset();
    photoService.getPhotos.mockReturnValue(photos$.asObservable());

    TestBed.configureTestingModule({
      providers: [{ provide: PhotoService, useValue: photoService }],
    });
  });

  it('loads the first batch and stores the returned photos', () => {
    const store = TestBed.inject(PhotoStreamStore);
    const photo: Photo = {
      id: '1',
      author: 'Example photographer',
      width: 500,
      height: 300,
      url: 'https://example.com/photo',
      download_url: 'https://picsum.photos/id/1/500/300',
    };

    store.loadMore();

    expect(photoService.getPhotos).toHaveBeenCalledWith(1, PHOTO_BATCH_SIZE);
    expect(store.loading()).toBe(true);

    photos$.next([photo]);

    expect(store.photos()).toEqual([photo]);
    expect(store.loading()).toBe(false);
  });

  it('does not start another request while loading', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    store.loadMore();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(1);
  });

  it('appends the next page to the existing photos', () => {
    const store = TestBed.inject(PhotoStreamStore);

    const firstPhoto: Photo = {
      id: '1',
      author: 'First photographer',
      width: 500,
      height: 300,
      url: 'https://example.com/1',
      download_url: 'https://picsum.photos/id/1/500/300',
    };

    const secondPhoto: Photo = {
      id: '2',
      author: 'Second photographer',
      width: 500,
      height: 300,
      url: 'https://example.com/2',
      download_url: 'https://picsum.photos/id/2/500/300',
    };

    store.loadMore();
    photos$.next([firstPhoto]);

    const nextPhotos$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReturnValue(nextPhotos$.asObservable());

    store.loadMore();
    expect(photoService.getPhotos).toHaveBeenCalledWith(2, PHOTO_BATCH_SIZE);

    nextPhotos$.next([secondPhoto]);
    expect(store.photos()).toEqual([firstPhoto, secondPhoto]);
  });

  it('reports an error and retries the failed page', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    photos$.error(new Error('Request failed'));

    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(true);

    const retryPhotos$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReturnValue(retryPhotos$.asObservable());

    store.loadMore();

    expect(store.hasError()).toBe(false);
    expect(store.loading()).toBe(true);
    expect(photoService.getPhotos).toHaveBeenCalledWith(1, PHOTO_BATCH_SIZE);

    retryPhotos$.next([]);

    expect(store.loading()).toBe(false);
  });

  it('starts the initial load only once', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.ensureLoaded();
    photos$.next([]);

    store.ensureLoaded();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(1);
  });

  it('starts again from page 1 after reaching the end', () => {
    const store = TestBed.inject(PhotoStreamStore);

    // First page has a photo.
    store.loadMore();
    photos$.next([
      {
        id: '1',
        author: 'Example photographer',
        width: 500,
        height: 300,
        url: 'https://example.com/photo',
        download_url: 'https://picsum.photos/id/1/500/300',
      },
    ]);

    // The next page is empty, indicating the end of the list.
    const emptyPage$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReturnValue(emptyPage$.asObservable());

    store.loadMore();
    expect(photoService.getPhotos).toHaveBeenLastCalledWith(
      2,
      PHOTO_BATCH_SIZE,
    );
    emptyPage$.next([]);

    // The following request should start a new cycle.
    const restartedPage$ = new Subject<Photo[]>();
    photoService.getPhotos.mockReturnValue(restartedPage$.asObservable());

    store.loadMore();

    expect(photoService.getPhotos).toHaveBeenLastCalledWith(
      1,
      PHOTO_BATCH_SIZE,
    );
  });

  it('reports an error when the first page is empty', () => {
    const store = TestBed.inject(PhotoStreamStore);

    store.loadMore();
    photos$.next([]);

    expect(store.loading()).toBe(false);
    expect(store.hasError()).toBe(true);
    expect(store.photos()).toEqual([]);
  });

  it('shuffles each loaded batch', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const store = TestBed.inject(PhotoStreamStore);

      const makePhoto = (id: string): Photo => ({
        id,
        author: 'Example photographer',
        width: 500,
        height: 300,
        url: `https://example.com/${id}`,
        download_url: `https://picsum.photos/id/${id}/500/300`,
      });

      store.loadMore();
      photos$.next([makePhoto('1'), makePhoto('2'), makePhoto('3')]);

      expect(store.photos().map((photo) => photo.id)).toEqual(['2', '3', '1']);
    } finally {
      random.mockRestore();
    }
  });
});
