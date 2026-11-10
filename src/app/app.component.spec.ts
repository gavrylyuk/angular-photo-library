import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }),
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'gallery-template'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('gallery-template');
  });

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

  it('should render router outlet', async () => {
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
});
