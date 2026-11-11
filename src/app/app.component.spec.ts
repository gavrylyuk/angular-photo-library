import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { PhotoService } from './services/photo.service';
import { of } from 'rxjs';
import { FavoritesStore } from './services/favorites.store';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ...appConfig.providers,
        { provide: PhotoService, useValue: { getPhotos: () => of([]) } },
      ],
    }),
  );

  it('provides navigation to photos and favorites', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const navigation = element.querySelector('nav');

    expect(navigation).not.toBeNull();
    expect(navigation?.querySelector('a[href="/"]')?.textContent).toContain(
      'Photos',
    );
    expect(
      navigation?.querySelector('a[href="/favorites"]')?.textContent,
    ).toContain('Favorites');
  });

  it('marks the current navigation link as active', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const photos = element.querySelector('a[href="/"]');
    const favorites = element.querySelector('a[href="/favorites"]');

    expect(photos?.getAttribute('aria-current')).toBe('page');
    expect(favorites?.getAttribute('aria-current')).toBeNull();

    await router.navigateByUrl('/favorites');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(photos?.getAttribute('aria-current')).toBeNull();
    expect(favorites?.getAttribute('aria-current')).toBe('page');
  });

  it('offers a retry when favorites cannot be saved', () => {
    const retryPersistence = vi.fn();

    TestBed.overrideProvider(FavoritesStore, {
      useValue: {
        persistenceError: signal(true),
        retryPersistence,
      },
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const alert = element.querySelector('[role="alert"]');
    const button = Array.from(element.querySelectorAll('button')).find((item) =>
      item.textContent?.includes('Retry saving'),
    );

    expect(alert?.textContent).toContain('Favorites could not be saved');
    expect(button).toBeDefined();

    button?.click();
    expect(retryPersistence).toHaveBeenCalledOnce();
  });
});
