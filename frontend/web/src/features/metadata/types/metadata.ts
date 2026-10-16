export type PersonRole = "director" | "actor";
export type MetadataKind = "genre" | PersonRole;

export type Genre = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export type Person = {
  id: string;
  name: string;
  country: string;
  biography: string;
  roles: PersonRole[];
  active: boolean;
};

export type MetadataSelection = {
  genreIds: string[];
  directorIds: string[];
  actorIds: string[];
};

export type ContentAssignment = MetadataSelection & { title: string };

export type MetadataState = {
  version: 1;
  genres: Genre[];
  people: Person[];
  assignments: Record<string, ContentAssignment>;
};

export type GenreInput = Omit<Genre, "id">;
export type PersonInput = Omit<Person, "id">;
export type ActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: string };
