// The public catalogue has its own DTO; it does not expose admin status or controls.
type CatalogTitle = {
  id: number;
  name: string;
  year: string;
  genre: string;
  cast: string;
  synopsis: string;
  rating: string;
  image: string;
};

export type CatalogEpisode = {
  id: number;
  number: number;
  title: string;
  duration: string;
  synopsis: string;
  videoUrl?: string;
};

export type CatalogPart = {
  id: number;
  name: string;
  episodes: CatalogEpisode[];
};

export type CatalogMovie =
  | (CatalogTitle & { type: 'Phim lẻ'; duration: string; videoUrl?: string })
  | (CatalogTitle & { type: 'Phim bộ'; parts: CatalogPart[] });
