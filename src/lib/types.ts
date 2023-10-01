import type { theaterIds } from './theaters';

export type TheaterId = keyof typeof theaterIds;

export type DiffusionVersion = 'LOCAL' | 'ORIGINAL' | 'DUBBED';
type Showtime = { startsAt: Date; version: DiffusionVersion };
export type Movie = {
  title: string;
  year: number;
  duration: string;
  allocineId: string;
  sensCritiqueRating?: number | null;
  sensCritiqueUrl?: string | null;
  userRating?: number | null;
  pressRating?: number | null;
  showtimes: Partial<Record<TheaterId, Array<Showtime>>>;
};

type Title = string;
export type Movies = Record<Title, Movie>;
