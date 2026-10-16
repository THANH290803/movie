"use client";

import { useSyncExternalStore } from "react";
import { initialMetadata } from "@/features/metadata/data/initial-metadata";
import {
  removeMetadata,
  selectionError,
  validateGenre,
  validatePerson,
} from "@/features/metadata/lib/metadata-rules";
import type {
  ActionResult,
  Genre,
  GenreInput,
  MetadataKind,
  MetadataSelection,
  MetadataState,
  Person,
  PersonInput,
} from "@/features/metadata/types/metadata";

export const METADATA_STORAGE_KEY = "cineflow.admin.metadata.v1";
let cachedRaw: string | null | undefined;
let snapshot = initialMetadata;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
function isState(value: unknown): value is MetadataState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.genres) ||
    !Array.isArray(value.people) ||
    !isRecord(value.assignments)
  )
    return false;
  return (
    value.genres.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.description === "string" &&
        typeof item.active === "boolean",
    ) &&
    value.people.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.country === "string" &&
        typeof item.biography === "string" &&
        typeof item.active === "boolean" &&
        isStringArray(item.roles) &&
        item.roles.length > 0 &&
        item.roles.every((role) => role === "actor" || role === "director"),
    ) &&
    Object.values(value.assignments).every(
      (item) =>
        isRecord(item) &&
        typeof item.title === "string" &&
        isStringArray(item.genreIds) &&
        isStringArray(item.directorIds) &&
        isStringArray(item.actorIds),
    )
  );
}

function getSnapshot(): MetadataState {
  try {
    const raw = window.localStorage.getItem(METADATA_STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const data: unknown = raw ? JSON.parse(raw) : null;
      snapshot = isState(data) ? data : initialMetadata;
    }
  } catch {
    // Keep rendering usable if browser storage is disabled or contains invalid JSON.
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === METADATA_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function commit<T>(next: MetadataState, value: T): ActionResult<T> {
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(METADATA_STORAGE_KEY, raw);
    snapshot = next;
    cachedRaw = raw;
    listeners.forEach((listener) => listener());
    return { ok: true, value };
  } catch {
    return {
      ok: false,
      error:
        "Không thể lưu vào trình duyệt. Hãy kiểm tra quyền lưu trữ hoặc dung lượng còn trống.",
    };
  }
}

export function useMetadataStore() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialMetadata);
}

export const metadataActions = {
  saveGenre(input: GenreInput, id?: string): ActionResult<Genre> {
    const state = getSnapshot();
    if (id && !state.genres.some((genre) => genre.id === id))
      return { ok: false, error: "Thể loại không còn tồn tại." };
    const error = validateGenre(state, input, id);
    if (error) return { ok: false, error };
    const genre: Genre = {
      ...input,
      id: id ?? crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
    };
    const genres = id
      ? state.genres.map((item) => (item.id === id ? genre : item))
      : [...state.genres, genre];
    return commit({ ...state, genres }, genre);
  },
  savePerson(input: PersonInput, id?: string): ActionResult<Person> {
    const state = getSnapshot();
    if (id && !state.people.some((person) => person.id === id))
      return { ok: false, error: "Hồ sơ không còn tồn tại." };
    const error = validatePerson(state, input, id);
    if (error) return { ok: false, error };
    const person: Person = {
      ...input,
      id: id ?? crypto.randomUUID(),
      name: input.name.trim(),
      country: input.country.trim(),
      biography: input.biography.trim(),
      roles: [...new Set(input.roles)],
    };
    const people = id
      ? state.people.map((item) => (item.id === id ? person : item))
      : [...state.people, person];
    return commit({ ...state, people }, person);
  },
  setActive(kind: MetadataKind, id: string, active: boolean): ActionResult {
    const state = getSnapshot();
    const exists =
      kind === "genre"
        ? state.genres.some((item) => item.id === id)
        : state.people.some((item) => item.id === id);
    if (!exists) return { ok: false, error: "Mục này không còn tồn tại." };
    return commit(
      kind === "genre"
        ? {
            ...state,
            genres: state.genres.map((item) =>
              item.id === id ? { ...item, active } : item,
            ),
          }
        : {
            ...state,
            people: state.people.map((item) =>
              item.id === id ? { ...item, active } : item,
            ),
          },
      undefined,
    );
  },
  remove(kind: MetadataKind, id: string): ActionResult {
    const result = removeMetadata(getSnapshot(), kind, id);
    return result.ok ? commit(result.value, undefined) : result;
  },
  saveAssignment(
    key: string,
    title: string,
    selection: MetadataSelection,
  ): ActionResult {
    const state = getSnapshot();
    const error = selectionError(state, selection);
    if (error) return { ok: false, error };
    return commit(
      {
        ...state,
        assignments: {
          ...state.assignments,
          [key]: {
            title: title.trim() || "Nội dung chưa đặt tên",
            genreIds: [...new Set(selection.genreIds)],
            directorIds: [...new Set(selection.directorIds)],
            actorIds: [...new Set(selection.actorIds)],
          },
        },
      },
      undefined,
    );
  },
};
