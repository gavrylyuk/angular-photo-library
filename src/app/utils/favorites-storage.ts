import { Photo } from '../models/photo';

const STORAGE_KEY = 'photo-library:favorites';

const isPhoto = (value: unknown): value is Photo => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const photo = value as Record<string, unknown>;

  return (
    typeof photo['id'] === 'string' &&
    typeof photo['author'] === 'string' &&
    typeof photo['width'] === 'number' &&
    typeof photo['height'] === 'number' &&
    typeof photo['url'] === 'string' &&
    typeof photo['download_url'] === 'string'
  );
};

export const readFavorites = (): Photo[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const value: unknown = JSON.parse(saved);

    return Array.isArray(value) ? value.filter(isPhoto) : [];
  } catch {
    return [];
  }
};

export const saveFavorites = (photos: Photo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
};
