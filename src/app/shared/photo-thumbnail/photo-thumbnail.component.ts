import { Component, input, linkedSignal } from '@angular/core';

import { Photo } from '../../models/photo';
import { photoThumbnailUrl } from '../../utils/photo-thumbnail-url';
import { ImageLoadState } from '../../models/image-load-state';

@Component({
  selector: 'app-photo-thumbnail',
  templateUrl: './photo-thumbnail.component.html',
  styleUrl: './photo-thumbnail.component.scss',
})
export class PhotoThumbnailComponent {
  readonly photo = input.required<Photo>();
  readonly photoThumbnailUrl = photoThumbnailUrl;

  readonly state = linkedSignal((): ImageLoadState => {
    this.photo();
    return 'loading';
  });
}
