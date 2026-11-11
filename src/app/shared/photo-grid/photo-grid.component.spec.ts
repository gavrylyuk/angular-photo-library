import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { Photo } from '../../models/photo';
import { PhotoGridComponent } from './photo-grid.component';
import { provideRouter } from '@angular/router';

const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('PhotoGridComponent', () => {
  it('emits the selected photo in select mode', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
    });

    const photo: Photo = TEST_PHOTO;

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [photo]);
    fixture.componentRef.setInput('mode', 'select');

    const selected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(selected);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Add photo by Example photographer to favorites"]',
    );

    expect(button).not.toBeNull();
    button?.click();

    expect(selected).toHaveBeenCalledWith(photo);
  });

  it('links a photo to its detail page in navigate mode', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
      providers: [provideRouter([])],
    });

    const photo: Photo = TEST_PHOTO;

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [photo]);
    fixture.componentRef.setInput('mode', 'navigate');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector<HTMLAnchorElement>(
      'a[href="/photos/1"]',
    );

    expect(link).not.toBeNull();
    expect(link?.querySelector('img')).not.toBeNull();
  });

  it('indicates when a photo is already saved', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
    });

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'select');
    fixture.componentRef.setInput('favoriteIds', new Set(['1']));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button');

    expect(button?.getAttribute('aria-label')).toBe(
      'Photo by Example photographer is already in favorites',
    );
    expect(button?.querySelector('.favorite-badge')?.textContent).toContain(
      'Saved',
    );
  });
});
