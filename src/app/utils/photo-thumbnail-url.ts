export const photoThumbnailUrl = (id: string): string => {
  return `https://picsum.photos/id/${encodeURIComponent(id)}/500/300`;
};
