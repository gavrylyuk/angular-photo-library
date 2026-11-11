import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { Photo } from '@app/models/photo';
import { PhotoGridComponent } from './photo-grid.component';

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

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'select');

    const selected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(selected);
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

    expect(selected).toHaveBeenCalledWith(TEST_PHOTO);
  });

  it('links a photo to its detail page in navigate mode', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'navigate');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(image).not.toBeNull();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    const link = element.querySelector<HTMLAnchorElement>(
      'a[href="/photos/1"]',
    );

    expect(link).not.toBeNull();
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

  it('prevents selecting a photo until its image loads', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
    });

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'select');

    const selected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(selected);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button');
    const image = element.querySelector('img');

    expect(button?.disabled).toBe(true);
    button?.click();
    expect(selected).not.toHaveBeenCalled();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(button?.disabled).toBe(false);
    button?.click();
    expect(selected).toHaveBeenCalledWith(TEST_PHOTO);
  });

  it('does not select a photo when its image fails', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
    });

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'select');

    const selected = vi.fn();
    fixture.componentInstance.photoSelected.subscribe(selected);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');
    const button = element.querySelector<HTMLButtonElement>('button');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Image unavailable');
    expect(button?.disabled).toBe(true);

    button?.click();
    expect(selected).not.toHaveBeenCalled();
  });

  it('does not provide a detail link when an image fails', () => {
    TestBed.configureTestingModule({
      imports: [PhotoGridComponent],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', [TEST_PHOTO]);
    fixture.componentRef.setInput('mode', 'navigate');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const link = element.querySelector('a');

    expect(element.textContent).toContain('Image unavailable');
    expect(link?.getAttribute('href')).toBeNull();
    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
  });
});
