"use client";

import { useState } from "react";
import {
  Clapperboard,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AdminStatusBadge } from "@/components/common/admin-status-badge";
import { AdminTablePagination } from "@/components/common/admin-table-pagination";
import { Modal } from "@/components/common/modal";
import { useAdminTablePagination } from "@/hooks/use-admin-table-pagination";
import {
  kindLabels,
  MetadataEditor,
} from "@/features/metadata/components/metadata-editor";
import {
  normalizeSearch,
  referencesFor,
} from "@/features/metadata/lib/metadata-rules";
import {
  metadataActions,
  useMetadataStore,
} from "@/features/metadata/stores/metadata-store";
import type {
  ActionResult,
  Genre,
  MetadataKind,
  Person,
} from "@/features/metadata/types/metadata";

const headings = {
  genre: "Thể loại",
  director: "Đạo diễn",
  actor: "Diễn viên",
};
const descriptions = {
  genre: "Quản lý danh mục thể loại dùng chung cho phim dài và phim bộ.",
  director: "Quản lý hồ sơ đạo diễn và các tác phẩm liên quan.",
  actor: "Quản lý hồ sơ diễn viên và dàn diễn viên của từng phim.",
};
type Row = Genre | Person;

export function MetadataScreen({ kind }: { kind: MetadataKind }) {
  const state = useMetadataStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<{ item?: Row } | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const source: Row[] =
    kind === "genre"
      ? state.genres
      : state.people.filter((person) => person.roles.includes(kind));
  const filtered = source.filter(
    (item) =>
      normalizeSearch(
        `${item.name} ${"country" in item ? item.country : item.description}`,
      ).includes(normalizeSearch(query)) &&
      (status === "all" || item.active === (status === "active")),
  );
  const {
    rows,
    page,
    pageSize,
    setPage,
    changePageSize,
    resetPage,
  } = useAdminTablePagination(filtered);
  const Icon =
    kind === "genre" ? Tag : kind === "director" ? Clapperboard : UserRound;

  function report(result: ActionResult, message: string) {
    setNotice({ text: result.ok ? message : result.error, error: !result.ok });
    return result.ok;
  }

  const deletingReferences = deleting
    ? kind === "genre"
      ? referencesFor(state, kind, deleting.id)
      : [
          ...new Map(
            [
              ...referencesFor(state, "director", deleting.id),
              ...referencesFor(state, "actor", deleting.id),
            ].map((item) => [item.key, item]),
          ).values(),
        ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="DANH MỤC NỘI DUNG"
        title={headings[kind]}
        description={descriptions[kind]}
        action={
          <button
            type="button"
            onClick={() => {
              setEditor({});
              setNotice(null);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
          >
            <Plus size={17} />
            Thêm {kindLabels[kind]}
          </button>
        }
      />
      {notice && (
        <div
          role={notice.error ? "alert" : "status"}
          className={`mb-6 flex items-start justify-between gap-3 rounded-xl p-4 text-sm font-medium ${notice.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {notice.text}
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setNotice(null)}
            className="shrink-0 underline"
          >
            Đóng
          </button>
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Tổng số", source.length, "bg-orange-100 text-orange-600"],
          [
            "Đang sử dụng",
            source.filter((item) => item.active).length,
            "bg-emerald-100 text-emerald-600",
          ],
          [
            "Đã ẩn",
            source.filter((item) => !item.active).length,
            "bg-slate-100 text-slate-500",
          ],
        ].map(([label, count, color]) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${color}`}
            >
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold">{count}</p>
            </div>
          </div>
        ))}
      </div>
      <section className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3.5 text-slate-400"
              />
              <input
                type="search"
                aria-label={`Tìm ${kindLabels[kind]}`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder={`Tìm ${kindLabels[kind]}...`}
                className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-orange-400 sm:w-72"
              />
            </div>
            <select
              aria-label="Lọc trạng thái"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetPage();
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang sử dụng</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            {filtered.length} {kindLabels[kind]}
          </p>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <caption className="sr-only">Danh sách {kindLabels[kind]}</caption>
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Tên",
                  kind === "genre" ? "Mô tả" : "Quốc gia / Vai trò",
                  "Nội dung liên quan",
                  "Trạng thái",
                  "Thao tác",
                ].map((heading) => (
                  <th scope="col" key={heading} className="px-3 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3 font-semibold">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                        {kind === "genre" ? (
                          <Tag size={17} />
                        ) : (
                          item.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                        )}
                      </span>
                      {item.name}
                    </div>
                  </td>
                  <td className="max-w-72 px-3 py-4 text-slate-500">
                    {"description" in item ? (
                      <p className="line-clamp-2">
                        {item.description || "Chưa có mô tả"}
                      </p>
                    ) : (
                      <>
                        <p>{item.country || "Chưa cập nhật"}</p>
                        <p className="mt-1 text-xs text-orange-600">
                          {item.roles
                            .map((role) =>
                              role === "director" ? "Đạo diễn" : "Diễn viên",
                            )
                            .join(" · ")}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {referencesFor(state, kind, item.id).length} phim / phim bộ
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge tone={item.active ? "success" : "neutral"}>
                      {item.active ? "Đang sử dụng" : "Đã ẩn"}
                    </AdminStatusBadge>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Chỉnh sửa ${item.name}`}
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditor({ item });
                          setNotice(null);
                        }}
                        className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa ${item.name}`}
                        title="Xóa"
                        onClick={() => {
                          setDeleting(item);
                          setNotice(null);
                        }}
                        className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="admin-table-empty">
            <Icon className="mx-auto text-slate-300" size={36} />
            <h2 className="mt-4 font-semibold">
              {query || status !== "all"
                ? "Không tìm thấy kết quả phù hợp"
                : `Chưa có ${kindLabels[kind]}`}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {query || status !== "all"
                ? "Thử từ khóa khác hoặc thay đổi bộ lọc."
                : "Thêm mục đầu tiên để bắt đầu quản lý danh mục."}
            </p>
          </div>
        )}
        <AdminTablePagination
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </section>
      {editor && (
        <MetadataEditor
          kind={kind}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setNotice({
              text: editor.item
                ? "Đã lưu thay đổi."
                : `Đã thêm ${kindLabels[kind]} mới.`,
              error: false,
            });
          }}
        />
      )}
      {deleting && (
        <Modal
          open
          title={`Xóa ${kindLabels[kind]}?`}
          description={`Bạn đang chọn ${deleting.name}. ${kind === "genre" ? "" : "Xóa sẽ xóa hồ sơ khỏi cả danh sách đạo diễn và diễn viên. "}Thao tác xóa không thể hoàn tác.`}
          onClose={() => setDeleting(null)}
        >
          {deletingReferences.length > 0 && (
            <div className="rounded-xl bg-orange-50 p-4 text-sm leading-6 text-orange-800">
              Mục này đang được {deletingReferences.length} phim / phim bộ sử
              dụng. Hãy gỡ hoặc thay liên kết của các phim trước khi xóa.
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={deletingReferences.length > 0}
              onClick={() => {
                if (
                  report(
                    metadataActions.remove(kind, deleting.id),
                    `Đã xóa ${deleting.name}.`,
                  )
                )
                  setDeleting(null);
              }}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Xác nhận xóa
            </button>
          </div>
        </Modal>
      )}
      <p className="mt-5 text-xs leading-5 text-slate-400">
        Danh mục được lưu trên trình duyệt này. Khi kết nối backend, dữ liệu sẽ
        được đồng bộ giữa các thiết bị.
      </p>
    </>
  );
}
