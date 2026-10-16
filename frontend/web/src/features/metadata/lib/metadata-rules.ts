import type {
  ActionResult,
  GenreInput,
  MetadataKind,
  MetadataSelection,
  MetadataState,
  PersonInput,
  PersonRole,
} from "@/features/metadata/types/metadata";

export const emptySelection: MetadataSelection = {
  genreIds: [],
  directorIds: [],
  actorIds: [],
};

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase();
}

export function referencesFor(
  state: MetadataState,
  kind: MetadataKind,
  id: string,
) {
  const field =
    kind === "genre"
      ? "genreIds"
      : kind === "director"
        ? "directorIds"
        : "actorIds";
  return Object.entries(state.assignments)
    .filter(([, assignment]) => assignment[field].includes(id))
    .map(([key, assignment]) => ({ key, title: assignment.title }));
}

export function contentMetadataLabels(state: MetadataState, key: string) {
  const assignment = state.assignments[key];
  if (!assignment) return undefined;
  return {
    genres: assignment.genreIds
      .map((id) => state.genres.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join(", "),
    directors: assignment.directorIds
      .map((id) => state.people.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join(", "),
    actors: assignment.actorIds
      .map((id) => state.people.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join(", "),
  };
}

export function validateGenre(
  state: MetadataState,
  input: GenreInput,
  id?: string,
): string | null {
  if (!input.name.trim()) return "Vui lòng nhập tên thể loại.";
  if (input.name.trim().length > 100)
    return "Tên thể loại không được quá 100 ký tự.";
  if (
    state.genres.some(
      (item) =>
        item.id !== id &&
        normalizeSearch(item.name) === normalizeSearch(input.name),
    )
  )
    return "Thể loại này đã tồn tại. Hãy chọn hoặc sửa mục có sẵn.";
  return null;
}

export function validatePerson(
  state: MetadataState,
  input: PersonInput,
  id?: string,
): string | null {
  if (!input.name.trim()) return "Vui lòng nhập họ và tên.";
  if (input.name.trim().length > 100)
    return "Họ và tên không được quá 100 ký tự.";
  if (
    !input.roles.length ||
    input.roles.some((role) => role !== "director" && role !== "actor")
  )
    return "Chọn ít nhất một vai trò.";
  if (
    state.people.some(
      (item) =>
        item.id !== id &&
        normalizeSearch(item.name) === normalizeSearch(input.name),
    )
  )
    return "Hồ sơ này đã tồn tại. Bạn có thể sửa hồ sơ và thêm vai trò còn lại.";
  const existing = state.people.find((item) => item.id === id);
  if (
    existing?.roles.some(
      (role) =>
        !input.roles.includes(role) &&
        referencesFor(state, role, existing.id).length,
    )
  )
    return "Không thể bỏ vai trò đang được phim sử dụng. Hãy thay liên kết của phim trước.";
  return null;
}

export function removeMetadata(
  state: MetadataState,
  kind: MetadataKind,
  id: string,
): ActionResult<MetadataState> {
  if (kind === "genre") {
    if (!state.genres.some((item) => item.id === id))
      return { ok: false, error: "Thể loại không còn tồn tại." };
    if (referencesFor(state, "genre", id).length)
      return {
        ok: false,
        error: "Thể loại đang được sử dụng. Bạn có thể ẩn thay vì xóa.",
      };
    return {
      ok: true,
      value: {
        ...state,
        genres: state.genres.filter((item) => item.id !== id),
      },
    };
  }
  // A person can have two roles. Deleting their profile checks BOTH roles.
  if (!state.people.some((item) => item.id === id))
    return { ok: false, error: "Hồ sơ không còn tồn tại." };
  if (
    referencesFor(state, "director", id).length ||
    referencesFor(state, "actor", id).length
  )
    return {
      ok: false,
      error: "Hồ sơ đang được phim sử dụng. Bạn có thể ẩn thay vì xóa.",
    };
  return {
    ok: true,
    value: { ...state, people: state.people.filter((item) => item.id !== id) },
  };
}

export function selectionError(
  state: MetadataState,
  selection: MetadataSelection,
): string | null {
  if (
    selection.genreIds.some(
      (id) => !state.genres.some((genre) => genre.id === id),
    )
  )
    return "Một thể loại đã bị xóa. Vui lòng chọn lại.";
  for (const role of ["director", "actor"] as PersonRole[]) {
    const ids =
      role === "director" ? selection.directorIds : selection.actorIds;
    if (
      ids.some(
        (id) =>
          !state.people.some(
            (person) => person.id === id && person.roles.includes(role),
          ),
      )
    )
      return "Một hồ sơ hoặc vai trò không còn tồn tại. Vui lòng chọn lại.";
  }
  return null;
}
