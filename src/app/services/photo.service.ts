import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Photo } from '../models/photo';
import { delay } from 'rxjs';

const PHOTO_API_URL = 'https://picsum.photos/v2/list';

@Service()
export class PhotoService {
  private readonly http = inject(HttpClient);

  getPhotos(page: number, limit: number) {
    const delayMs = 200 + Math.floor(Math.random() * 101);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<Photo[]>(PHOTO_API_URL, { params }).pipe(
      // Simulate network delay for demonstration purposes
      delay(delayMs),
    );
  }
}
