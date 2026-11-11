import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PhotoService } from './photo.service';
import { Photo } from '@app/models/photo';
import { PHOTO_BATCH_SIZE } from './photo-stream.constants';

const PHOTO_LIST_URL = 'https://picsum.photos/v2/list';

describe('PhotoService', () => {
  let service: PhotoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PhotoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('requests a page of photos from Picsum', () => {
    vi.useFakeTimers();

    try {
      const photos: Photo[] = [];

      service.getPhotos(1, PHOTO_BATCH_SIZE).subscribe((result) => {
        photos.push(...result);
      });

      const request = http.expectOne(
        (req) =>
          req.url === PHOTO_LIST_URL &&
          req.params.get('page') === '1' &&
          req.params.get('limit') === PHOTO_BATCH_SIZE.toString(),
      );

      expect(request.request.method).toBe('GET');

      request.flush([
        {
          id: '1',
          author: 'Example photographer',
          width: 500,
          height: 300,
          url: 'https://picsum.photos/500/300',
          download_url: 'https://picsum.photos/id/1/500/300',
        },
      ]);

      vi.advanceTimersByTime(300);

      expect(photos).toHaveLength(1);
      expect(photos[0].download_url).toBe('https://picsum.photos/id/1/500/300');
    } finally {
      vi.useRealTimers();
    }
  });

  it('delays a successful response by the selected delay', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    try {
      let received = false;

      service.getPhotos(1, PHOTO_BATCH_SIZE).subscribe(() => {
        received = true;
      });

      const request = http.expectOne(
        (req) =>
          req.url === PHOTO_LIST_URL &&
          req.params.get('page') === '1' &&
          req.params.get('limit') === PHOTO_BATCH_SIZE.toString(),
      );

      request.flush([]);

      expect(received).toBe(false);

      vi.advanceTimersByTime(249);
      expect(received).toBe(false);

      vi.advanceTimersByTime(1);
      expect(received).toBe(true);
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });

  it('reports an HTTP error to the caller', () => {
    let status: number | undefined;

    service.getPhotos(1, PHOTO_BATCH_SIZE).subscribe({
      error: (error: { status: number }) => {
        status = error.status;
      },
    });

    const request = http.expectOne(
      (req) =>
        req.url === PHOTO_LIST_URL &&
        req.params.get('page') === '1' &&
        req.params.get('limit') === PHOTO_BATCH_SIZE.toString(),
    );

    request.flush('Service unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    expect(status).toBe(503);
  });

  it.each([
    { randomValue: 0, expectedDelay: 200 },
    { randomValue: 0.999, expectedDelay: 300 },
  ])(
    'delivers a response after $expectedDelay ms',
    ({ randomValue, expectedDelay }) => {
      vi.useFakeTimers();
      const random = vi.spyOn(Math, 'random').mockReturnValue(randomValue);

      try {
        let received = false;

        service.getPhotos(1, PHOTO_BATCH_SIZE).subscribe(() => {
          received = true;
        });

        const request = http.expectOne((req) => req.url === PHOTO_LIST_URL);

        request.flush([]);

        vi.advanceTimersByTime(expectedDelay - 1);
        expect(received).toBe(false);

        vi.advanceTimersByTime(1);
        expect(received).toBe(true);
      } finally {
        random.mockRestore();
        vi.useRealTimers();
      }
    },
  );
});
