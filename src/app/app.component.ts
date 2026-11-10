import { Component, ChangeDetectionStrategy } from '@angular/core';

/* eslint-disable @angular-eslint/prefer-on-push-component-change-detection, @angular-eslint/prefer-standalone -- Temporary exceptions for the migrated NgModule-based starter. */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
/* eslint-enable @angular-eslint/prefer-on-push-component-change-detection, @angular-eslint/prefer-standalone */
export class AppComponent {
  title = 'gallery-template';
}
