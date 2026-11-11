import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Photo } from '@app/models/photo';
import { FavoritesStore } from '@app/services/favorites.store';
import { FavoritesComponent } from './favorites.component';

const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('FavoritesComponent', () => {
  const photo: Photo = TEST_PHOTO;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        provideRouter([]),
        {
          provide: FavoritesStore,
          useValue: { photos: signal([photo]) },
        },
      ],
    });
  });

  it('links a favorite photo to its detail page', () => {
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(image).not.toBeNull();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    const link = element.querySelector('a[href="/photos/1"]');

    expect(link).not.toBeNull();
  });

  it('shows a message when there are no favorites', () => {
    TestBed.overrideProvider(FavoritesStore, {
      useValue: { photos: signal([]) },
    });

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('No favorites yet');
    expect(element.querySelector('app-photo-grid')).toBeNull();
  });
});
