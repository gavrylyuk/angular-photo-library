import { TestBed } from '@angular/core/testing';
import { FavoritesStore } from './favorites.store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Photo } from '../models/photo';

const STORAGE_KEY = 'photo-library:favorites';
const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('FavoritesStore', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('adds a photo to favorites', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    store.add(photo);

    expect(store.photos()).toEqual([photo]);
  });

  it('does not add the same photo twice', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    store.add(photo);
    store.add(photo);

    expect(store.photos()).toEqual([photo]);
  });

  it('saves favorites to local storage', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    store.add(photo);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual([
      photo,
    ]);
  });

  it('restores saved favorites when created', () => {
    const photo: Photo = TEST_PHOTO;

    localStorage.setItem(STORAGE_KEY, JSON.stringify([photo]));

    const store = TestBed.inject(FavoritesStore);

    expect(store.photos()).toEqual([photo]);
  });

  it.each([
    { description: 'invalid JSON', value: '{invalid' },
    { description: 'a non-array value', value: '{"id":"1"}' },
    { description: 'an invalid photo', value: '[{"id":"1"}]' },
  ])('starts empty when storage contains $description', ({ value }) => {
    localStorage.setItem(STORAGE_KEY, value);

    const store = TestBed.inject(FavoritesStore);

    expect(store.photos()).toEqual([]);
  });

  it('keeps the photo in memory and reports a storage failure', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    const save = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

    try {
      store.add(photo);

      expect(store.photos()).toEqual([photo]);
      expect(store.persistenceError()).toBe(true);
    } finally {
      save.mockRestore();
    }
  });

  it('removes a photo from favorites and storage', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    store.add(photo);
    store.remove(photo.id);

    expect(store.photos()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual([]);
  });

  it('retries saving favorites after a storage failure', () => {
    const store = TestBed.inject(FavoritesStore);
    const photo: Photo = TEST_PHOTO;

    const save = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

    try {
      store.add(photo);
      expect(store.persistenceError()).toBe(true);

      save.mockRestore();
      store.retryPersistence();

      expect(store.persistenceError()).toBe(false);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual([
        photo,
      ]);
    } finally {
      save.mockRestore();
    }
  });
});
