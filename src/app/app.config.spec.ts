import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { Photo } from '@app/models/photo';
import { PhotoService } from '@app/services/photo.service';
import { appConfig } from './app.config';

const SEED = '00000000-0000-4000-8000-000000000001';

const TEST_PHOTO: Photo = {
  id: '1',
  author: 'Example photographer',
  width: 500,
  height: 300,
  url: 'https://example.com/photo',
  download_url: 'https://picsum.photos/id/1/500/300',
};

describe('application HTTP configuration', () => {
  it('applies the random photo delay once', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const seed = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValue(SEED);

    try {
      TestBed.configureTestingModule({
        providers: [...appConfig.providers, provideHttpClientTesting()],
      });

      const service = TestBed.inject(PhotoService);
      const requests = TestBed.inject(HttpTestingController);
      const received: Photo[][] = [];

      service.getRandomPhotos(1).subscribe((photos) => {
        received.push(photos);
      });

      requests
        .expectOne(`https://picsum.photos/seed/${SEED}/info`)
        .flush(TEST_PHOTO);

      vi.advanceTimersByTime(249);
      expect(received).toEqual([]);

      vi.advanceTimersByTime(1);
      expect(received).toEqual([[TEST_PHOTO]]);

      requests.verify();
    } finally {
      seed.mockRestore();
      random.mockRestore();
      vi.useRealTimers();
    }
  });
});
