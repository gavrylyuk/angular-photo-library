import {
  HttpContextToken,
  HttpEventType,
  HttpInterceptorFn,
} from '@angular/common/http';
import { concatMap, delay, of } from 'rxjs';

import {
  MAX_SIMULATED_DELAY_MS,
  MIN_SIMULATED_DELAY_MS,
} from '@app/constants/simulated-delay.constants';

export const SIMULATE_PHOTO_DELAY = new HttpContextToken<boolean>(() => false);

export const simulatedDelayInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.context.get(SIMULATE_PHOTO_DELAY)) {
    return next(request);
  }

  const delayMs =
    MIN_SIMULATED_DELAY_MS +
    Math.floor(
      Math.random() * (MAX_SIMULATED_DELAY_MS - MIN_SIMULATED_DELAY_MS + 1),
    );

  return next(request).pipe(
    concatMap((event) =>
      event.type === HttpEventType.Response
        ? of(event).pipe(delay(delayMs))
        : of(event),
    ),
  );
};
