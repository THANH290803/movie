export type Episode = {
  id: number;
  slug: string;
  number: number;
  title: string;
  duration: string;
  status: string;
  synopsis: string;
};
export type Part = { id: number; name: string; episodes: Episode[] };
export type Series = {
  id: number;
  slug: string;
  name: string;
  year: string;
  genre: string;
  rating: string;
  cast: string;
  synopsis: string;
  parts: Part[];
};
