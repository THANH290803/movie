export type Episode = {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: string;
  synopsis: string;
};
export type Part = { id: number; name: string; episodes: Episode[] };
export type Series = {
  id: number;
  name: string;
  year: string;
  genre: string;
  rating: string;
  cast: string;
  synopsis: string;
  parts: Part[];
};
