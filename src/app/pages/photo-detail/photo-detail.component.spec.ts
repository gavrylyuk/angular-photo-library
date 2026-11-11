import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Photo } from '../../models/photo';
import { FavoritesStore } from '../../services/favorites.store';
import { PhotoDetailComponent } from './photo-detail.component';

const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('PhotoDetailComponent', () => {
  it('displays the favorite selected by the route id', () => {
    const photo: Photo = TEST_PHOTO;

    TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        {
          provide: FavoritesStore,
          useValue: { photos: signal([photo]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(image?.getAttribute('src')).toBe(photo.download_url);
    expect(image?.getAttribute('alt')).toBe('Photo by Example photographer');
  });

  it('removes the photo and returns to favorites', () => {
    const photo: Photo = TEST_PHOTO;

    const remove = vi.fn();
    const navigate = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        {
          provide: FavoritesStore,
          useValue: { photos: signal([photo]), remove },
        },
        {
          provide: Router,
          useValue: { navigate },
        },
      ],
    });

    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button');

    expect(button?.textContent).toContain('Remove from favorites');

    button?.click();

    expect(remove).toHaveBeenCalledWith('1');
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });

  it('shows a message when the photo is not in favorites', () => {
    TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'missing' })) },
        },
        {
          provide: FavoritesStore,
          useValue: { photos: signal([]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Photo not found in favorites');
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('button')).toBeNull();
    expect(element.querySelector('a[href="/favorites"]')).not.toBeNull();
  });

  it('shows a loading indicator until the photo loads', () => {
    TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        {
          provide: FavoritesStore,
          useValue: { photos: signal([TEST_PHOTO]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(element.querySelector('[role="status"]')).not.toBeNull();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('shows an error when the detail image fails to load', () => {
    TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        {
          provide: FavoritesStore,
          useValue: { photos: signal([TEST_PHOTO]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to load the photo',
    );
  });
});
