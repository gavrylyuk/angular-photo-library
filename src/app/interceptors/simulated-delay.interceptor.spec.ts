import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import {
  SIMULATE_PHOTO_DELAY,
  simulatedDelayInterceptor,
} from './simulated-delay.interceptor';

describe('simulatedDelayInterceptor', () => {
  it('delays an opted-in response by the selected duration', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([simulatedDelayInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      const http = TestBed.inject(HttpClient);
      const requests = TestBed.inject(HttpTestingController);
      const responses: { message: string }[] = [];

      http
        .get<{ message: string }>('/test', {
          context: new HttpContext().set(SIMULATE_PHOTO_DELAY, true),
        })
        .subscribe((response) => responses.push(response));

      requests.expectOne('/test').flush({ message: 'ok' });

      expect(responses).toEqual([]);

      vi.advanceTimersByTime(249);
      expect(responses).toEqual([]);

      vi.advanceTimersByTime(1);
      expect(responses).toEqual([{ message: 'ok' }]);

      requests.verify();
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });

  it('does not delay requests without opt-in', () => {
    vi.useFakeTimers();

    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([simulatedDelayInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      const http = TestBed.inject(HttpClient);
      const requests = TestBed.inject(HttpTestingController);
      const responses: { message: string }[] = [];

      http.get<{ message: string }>('/test').subscribe((response) => {
        responses.push(response);
      });

      requests.expectOne('/test').flush({ message: 'ok' });

      expect(responses).toEqual([{ message: 'ok' }]);
      requests.verify();
    } finally {
      vi.useRealTimers();
    }
  });

  it('passes errors through without a delay', () => {
    vi.useFakeTimers();

    try {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([simulatedDelayInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      const http = TestBed.inject(HttpClient);
      const requests = TestBed.inject(HttpTestingController);
      let status: number | undefined;

      http
        .get('/test', {
          context: new HttpContext().set(SIMULATE_PHOTO_DELAY, true),
        })
        .subscribe({
          error: (error: HttpErrorResponse) => {
            status = error.status;
          },
        });

      requests.expectOne('/test').flush('Service unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      expect(status).toBe(503);
      requests.verify();
    } finally {
      vi.useRealTimers();
    }
  });
});
