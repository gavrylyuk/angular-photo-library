import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { appConfig } from './app.config';
import { PhotoService } from '@app/services/photo.service';

describe('application HTTP configuration', () => {
  it('applies the photo delay once', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    try {
      TestBed.configureTestingModule({
        providers: [...appConfig.providers, provideHttpClientTesting()],
      });

      const service = TestBed.inject(PhotoService);
      const requests = TestBed.inject(HttpTestingController);
      let received = false;

      service.getPhotos(1, 12).subscribe(() => {
        received = true;
      });

      requests
        .expectOne((request) => request.url === 'https://picsum.photos/v2/list')
        .flush([]);

      vi.advanceTimersByTime(249);
      expect(received).toBe(false);

      vi.advanceTimersByTime(1);
      expect(received).toBe(true);

      requests.verify();
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });
});
