import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { PICSUM_BASE_URL } from '@app/constants/picsum.constants';
import { Photo } from '@app/models/photo';
import { SIMULATE_PHOTO_DELAY } from '@app/interceptors/simulated-delay.interceptor';
import { defer, forkJoin, of } from 'rxjs';

@Service()
export class PhotoService {
  private readonly http = inject(HttpClient);

  getRandomPhotos(count: number) {
    return defer(() => {
      const requests = Array.from({ length: count }, () => {
        const seed = globalThis.crypto.randomUUID();

        return this.http.get<Photo>(
          `${PICSUM_BASE_URL}/seed/${encodeURIComponent(seed)}/info`,
          {
            context: new HttpContext().set(SIMULATE_PHOTO_DELAY, true),
          },
        );
      });

      return requests.length > 0 ? forkJoin(requests) : of([]);
    });
  }
}
