import { Component, input, linkedSignal } from '@angular/core';
import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
} from '@app/constants/picsum.constants';
import { ImageLoadState } from '@app/models/image-load-state';
import { Photo } from '@app/models/photo';
import { photoThumbnailUrl } from '@app/utils/photo-thumbnail-url';

@Component({
  selector: 'app-photo-thumbnail',
  templateUrl: './photo-thumbnail.component.html',
  styleUrl: './photo-thumbnail.component.scss',
})
export class PhotoThumbnailComponent {
  readonly photo = input.required<Photo>();
  readonly photoThumbnailUrl = photoThumbnailUrl;
  readonly thumbnailWidth = THUMBNAIL_WIDTH;
  readonly thumbnailHeight = THUMBNAIL_HEIGHT;

  readonly state = linkedSignal((): ImageLoadState => {
    this.photo();
    return 'loading';
  });
}
