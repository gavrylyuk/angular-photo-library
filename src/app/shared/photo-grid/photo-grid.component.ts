import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Photo } from '../../models/photo';
import { PhotoThumbnailComponent } from '../photo-thumbnail/photo-thumbnail.component';

export type PhotoGridMode = 'select' | 'navigate';

@Component({
  selector: 'app-photo-grid',
  imports: [PhotoThumbnailComponent, RouterLink],
  templateUrl: './photo-grid.component.html',
  styleUrl: './photo-grid.component.scss',
})
export class PhotoGridComponent {
  readonly photos = input.required<Photo[]>();
  readonly mode = input<PhotoGridMode>('select');
  readonly favoriteIds = input<ReadonlySet<string>>(new Set());
  readonly photoSelected = output<Photo>();
}
