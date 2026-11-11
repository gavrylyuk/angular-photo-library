import {
  PICSUM_BASE_URL,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
} from '@app/constants/picsum.constants';

export const photoThumbnailUrl = (id: string): string => {
  return `${PICSUM_BASE_URL}/id/${encodeURIComponent(id)}/${THUMBNAIL_WIDTH}/${THUMBNAIL_HEIGHT}`;
};
