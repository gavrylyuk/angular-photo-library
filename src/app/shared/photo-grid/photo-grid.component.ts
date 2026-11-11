import { Component, input, output } from '@angular/core';
import { Photo } from '../../models/photo';
import { photoThumbnailUrl } from '../../utils/photo-thumbnail-url';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

export type PhotoGridMode = 'select' | 'navigate';

@Component({
  selector: 'app-photo-grid',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './photo-grid.component.html',
  styleUrl: './photo-grid.component.scss',
})
export class PhotoGridComponent {
  readonly photos = input.required<Photo[]>();
  readonly mode = input<PhotoGridMode>('select');
  readonly photoSelected = output<Photo>();

  readonly photoThumbnailUrl = photoThumbnailUrl;
}
