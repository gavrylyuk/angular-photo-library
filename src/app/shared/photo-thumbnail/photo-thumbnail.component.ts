import { Component, input, linkedSignal } from '@angular/core';
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

  readonly state = linkedSignal((): ImageLoadState => {
    this.photo();
    return 'loading';
  });
}
