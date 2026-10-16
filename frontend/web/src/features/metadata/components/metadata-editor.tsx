"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Modal } from "@/components/common/modal";
import { metadataActions } from "@/features/metadata/stores/metadata-store";
import type {
  Genre,
  MetadataKind,
  Person,
  PersonRole,
} from "@/features/metadata/types/metadata";

export const kindLabels: Record<MetadataKind, string> = {
  genre: "thể loại",
  director: "đạo diễn",
  actor: "diễn viên",
};
const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export function MetadataEditor({
  kind,
  item,
  initialName = "",
  onClose,
  onSaved,
}: {
  kind: MetadataKind;
  item?: Genre | Person;
  initialName?: string;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const person = item && "roles" in item ? item : undefined;
  const genre = item && "description" in item ? item : undefined;
  const [name, setName] = useState(item?.name ?? initialName);
  const [description, setDescription] = useState(
    genre?.description ?? person?.biography ?? "",
  );
  const [country, setCountry] = useState(person?.country ?? "");
  const [roles, setRoles] = useState<PersonRole[]>(
    person?.roles ?? (kind === "genre" ? [] : [kind]),
  );
  const [active, setActive] = useState(item?.active ?? true);
  const [error, setError] = useState("");

  return (
    <Modal
      open
      wide
      title={`${item ? "Chỉnh sửa" : "Thêm"} ${kindLabels[kind]}`}
      description={
        kind === "genre"
          ? "Danh mục dùng chung khi tạo và chỉnh sửa phim, phim bộ."
          : "Một người có thể vừa là đạo diễn vừa là diễn viên. Hồ sơ được dùng chung giữa hai danh sách."
      }
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const result =
            kind === "genre"
              ? metadataActions.saveGenre(
                  { name, description, active },
                  item?.id,
                )
              : metadataActions.savePerson(
                  { name, country, biography: description, roles, active },
                  item?.id,
                );
          if (!result.ok) {
            setError(result.error);
            return;
          }
          onSaved(result.value.id);
        }}
        className="flex flex-1 flex-col"
      >
        <div className="grid gap-4 min-[520px]:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            {kind === "genre" ? "Tên thể loại" : "Họ và tên"}{" "}
            <span className="sr-only">bắt buộc</span>
            <input
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder={
                kind === "genre"
                  ? "Ví dụ: Hành động"
                  : kind === "director"
                    ? "Ví dụ: Christopher Nolan"
                    : "Ví dụ: Timothée Chalamet"
              }
              className={inputClass}
            />
          </label>
          {kind !== "genre" && (
            <>
              <label className="grid gap-2 text-sm font-semibold">
                Quốc gia
                <input
                  maxLength={100}
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="Ví dụ: Việt Nam"
                  className={inputClass}
                />
              </label>
              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-semibold">Vai trò</legend>
              <div className="flex min-h-[42px] flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  {(["director", "actor"] as PersonRole[]).map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={roles.includes(role)}
                        onChange={() => {
                          setRoles(
                            roles.includes(role)
                              ? roles.filter((item) => item !== role)
                              : [...roles, role],
                          );
                          setError("");
                        }}
                        className="size-4 accent-orange-500"
                      />
                      {role === "director" ? "Đạo diễn" : "Diễn viên"}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <label className="grid gap-2 text-sm font-semibold">
            Trạng thái
            <select
              value={active ? "active" : "hidden"}
              onChange={(event) => setActive(event.target.value === "active")}
              className={inputClass}
            >
              <option value="active">Đang sử dụng</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </label>
          <label className="col-span-full grid gap-2 text-sm font-semibold">
            {kind === "genre" ? "Mô tả" : "Giới thiệu"}
            <textarea
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder={
                kind === "genre"
                  ? "Mô tả ngắn về thể loại..."
                  : "Giới thiệu và những tác phẩm nổi bật..."
              }
            />
          </label>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Save size={16} />
            {item ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
