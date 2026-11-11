import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PhotoService } from './photo.service';
import { Photo } from '@app/models/photo';
import {
  SIMULATE_PHOTO_DELAY,
  simulatedDelayInterceptor,
} from '@app/interceptors/simulated-delay.interceptor';

const PHOTO_URL = 'https://picsum.photos/id/1/500/300';
const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: PHOTO_URL,
};

describe('PhotoService', () => {
  let service: PhotoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([simulatedDelayInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PhotoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('requests a random batch using a different seed for each photo', () => {
    vi.useFakeTimers();

    const seeds = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002');

    try {
      const received: Photo[][] = [];
      const secondPhoto: Photo = { ...TEST_PHOTO, id: '2' };

      service.getRandomPhotos(2).subscribe((photos) => {
        received.push(photos);
      });

      const first = http.expectOne(
        'https://picsum.photos/seed/00000000-0000-4000-8000-000000000001/info',
      );
      const second = http.expectOne(
        'https://picsum.photos/seed/00000000-0000-4000-8000-000000000002/info',
      );

      expect(first.request.context.get(SIMULATE_PHOTO_DELAY)).toBe(true);
      expect(second.request.context.get(SIMULATE_PHOTO_DELAY)).toBe(true);

      first.flush(TEST_PHOTO);
      second.flush(secondPhoto);

      vi.advanceTimersByTime(300);

      expect(received).toEqual([[TEST_PHOTO, secondPhoto]]);
    } finally {
      seeds.mockRestore();
      vi.useRealTimers();
    }
  });

  it('reports a batch error and cancels the remaining requests', () => {
    const seeds = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002');

    try {
      let status: number | undefined;

      service.getRandomPhotos(2).subscribe({
        error: (error: { status: number }) => {
          status = error.status;
        },
      });

      const first = http.expectOne(
        'https://picsum.photos/seed/00000000-0000-4000-8000-000000000001/info',
      );
      const second = http.expectOne(
        'https://picsum.photos/seed/00000000-0000-4000-8000-000000000002/info',
      );

      first.flush('Service unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      expect(status).toBe(503);
      expect(second.cancelled).toBe(true);
    } finally {
      seeds.mockRestore();
    }
  });
});
