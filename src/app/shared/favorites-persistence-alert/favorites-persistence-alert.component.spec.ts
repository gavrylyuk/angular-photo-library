import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesPersistenceAlertComponent } from './favorites-persistence-alert.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('FavoritesPersistenceAlertComponent', () => {
  let component: FavoritesPersistenceAlertComponent;
  let fixture: ComponentFixture<FavoritesPersistenceAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPersistenceAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPersistenceAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
