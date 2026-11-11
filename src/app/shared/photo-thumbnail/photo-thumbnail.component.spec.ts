import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { Photo } from '../../models/photo';
import { PhotoThumbnailComponent } from './photo-thumbnail.component';

const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: 'https://picsum.photos/id/1/500/300',
};

describe('PhotoThumbnailComponent', () => {
  it('shows a placeholder until the image loads', () => {
    TestBed.configureTestingModule({
      imports: [PhotoThumbnailComponent],
    });

    const fixture = TestBed.createComponent(PhotoThumbnailComponent);
    fixture.componentRef.setInput('photo', TEST_PHOTO);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(element.querySelector('.thumbnail-placeholder')).not.toBeNull();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(element.querySelector('.thumbnail-placeholder')).toBeNull();
  });

  it('shows a fallback when the image fails to load', () => {
    TestBed.configureTestingModule({
      imports: [PhotoThumbnailComponent],
    });

    const fixture = TestBed.createComponent(PhotoThumbnailComponent);
    fixture.componentRef.setInput('photo', TEST_PHOTO);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element.querySelector('.thumbnail-placeholder')).toBeNull();
    expect(element.querySelector('.thumbnail-error')?.textContent).toContain(
      'Image unavailable',
    );
  });

  it('shows the placeholder again when the photo changes', () => {
    TestBed.configureTestingModule({
      imports: [PhotoThumbnailComponent],
    });

    const fixture = TestBed.createComponent(PhotoThumbnailComponent);
    fixture.componentRef.setInput('photo', TEST_PHOTO);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('img');

    expect(image).not.toBeNull();
    expect(image?.classList.contains('image-loading')).toBe(true);
    expect(element.querySelector('.thumbnail-placeholder')).not.toBeNull();

    image?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(image?.classList.contains('image-loading')).toBe(false);
    expect(element.querySelector('.thumbnail-placeholder')).toBeNull();

    fixture.componentRef.setInput('photo', { ...TEST_PHOTO, id: '2' });
    fixture.detectChanges();

    expect(image?.classList.contains('image-loading')).toBe(true);
    expect(element.querySelector('.thumbnail-placeholder')).not.toBeNull();
  });
});
