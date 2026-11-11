import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { PICSUM_BASE_URL } from '@app/constants/picsum.constants';
import { Photo } from '@app/models/photo';
import { SIMULATE_PHOTO_DELAY } from '@app/interceptors/simulated-delay.interceptor';

@Service()
export class PhotoService {
  private readonly http = inject(HttpClient);

  getPhotos(page: number, limit: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<Photo[]>(`${PICSUM_BASE_URL}/v2/list`, {
      params,
      context: new HttpContext().set(SIMULATE_PHOTO_DELAY, true),
    });
  }
}
