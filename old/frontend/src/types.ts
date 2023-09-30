export type DiffusionVersion = "LOCAL" | "ORIGINAL" | "DUBBED";
export type Movie = {
  title: string;
  duration: string;
  allocineId: string;
  sensCritiqueRating?: number;
  sensCritiqueUrl?: string;
  userRating?: number;
  pressRating?: number;
  showtimes: Record<string, { startsAt: string; version: DiffusionVersion }[]>;
};
