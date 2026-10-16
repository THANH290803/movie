"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Edit3, Eye, Play, Plus, Search, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AdminStatusBadge } from "@/components/common/admin-status-badge";
import { AdminTablePagination } from "@/components/common/admin-table-pagination";
import { useMetadataStore } from "@/features/metadata/stores/metadata-store";
import { contentMetadataLabels } from "@/features/metadata/lib/metadata-rules";
import { useAdminTablePagination } from "@/hooks/use-admin-table-pagination";

import type { Movie } from "@/features/movies/types/movie";
import { mockMovies } from "@/features/movies/data/mock-movies";

type Form = Pick<
  Movie,
  "name" | "year" | "status" | "genre" | "cast" | "synopsis"
>;
export default function MoviesPage() {
  const metadata = useMetadataStore();
  const [movies, setMovies] = useState(mockMovies);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Movie | null>(null);
  const [viewing, setViewing] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState<Movie | null>(null);
  const [form, setForm] = useState<Form>({
    name: "",
    year: "2024",
    status: "Bản nháp",
    genre: "",
    cast: "",
    synopsis: "",
  });
  const filtered = useMemo(
    () =>
      movies.filter((movie) =>
        movie.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [movies, query],
  );
  const {
    rows: paginatedMovies,
    page,
    pageSize,
    setPage,
    changePageSize,
    resetPage,
  } = useAdminTablePagination(filtered);
  const save = () => {
    if (!form.name.trim() || !editing) return;
    if (editing.id === 0)
      setMovies((current) => [
        ...current,
        { id: Date.now(), ...form, name: form.name.trim() },
      ]);
    else
      setMovies((current) =>
        current.map((movie) =>
          movie.id === editing.id
            ? { ...movie, ...form, name: form.name.trim() }
            : movie,
        ),
      );
    setEditing(null);
  };
  const remove = () => {
    if (deleting)
      setMovies((current) =>
        current.filter((movie) => movie.id !== deleting.id),
      );
    setDeleting(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="KHO NỘI DUNG"
        title="Kho phim"
        description="Phim dài là nội dung chỉ có một tập duy nhất, có thể xem chi tiết và phát thử ngay trong admin."
        action={
          <Link
            href="/admin/movies/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"
          >
            <Plus size={17} /> Thêm phim dài
          </Link>
        }
      />
      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Tìm tên phim..."
              className="rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-400"
            />
          </div>
          <p className="text-sm text-slate-500">{filtered.length} phim dài</p>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <caption className="sr-only">Danh sách phim dài</caption>
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Tên phim",
                  "Loại",
                  "Năm",
                  "Thể loại",
                  "Trạng thái",
                  "Thao tác",
                ].map((heading) => (
                  <th scope="col" className="px-3 py-4" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedMovies.map((movie) => (
                <tr className="border-b border-slate-50" key={movie.id}>
                  <td className="px-3 py-4 font-semibold">{movie.name}</td>
                  <td className="px-3">
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                      Phim dài · 01 tập
                    </span>
                  </td>
                  <td className="px-3 text-slate-500">{movie.year}</td>
                  <td className="px-3 text-slate-500">
                    {contentMetadataLabels(metadata, `movie:${movie.id}`)
                      ?.genres ?? movie.genre}
                  </td>
                  <td className="px-3">
                    <AdminStatusBadge
                      tone={
                        movie.status === "Đang chiếu" ? "success" : "neutral"
                      }
                    >
                      {movie.status}
                    </AdminStatusBadge>
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/movies/${movie.id}`}
                        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-600"
                        aria-label={`Xem chi tiết ${movie.name}`}
                        title="Xem chi tiết"
                      >
                        <Eye size={17} />
                      </Link>
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        aria-label={`Sửa ${movie.name}`}
                        title="Sửa phim"
                      >
                        <Edit3 size={17} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleting(movie)}
                        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                        aria-label={`Xóa ${movie.name}`}
                        title="Xóa phim"
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
        {filtered.length === 0 && (
          <p className="admin-table-empty">Không tìm thấy phim dài phù hợp.</p>
        )}
        <AdminTablePagination
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>
      {editing && (
        <Modal
          wide
          title={editing.id === 0 ? "Thêm phim dài" : "Sửa thông tin phim"}
          close={() => setEditing(null)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Tên phim"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              placeholder="Ví dụ: Interstellar"
              wide
            />
            <Field
              label="Năm phát hành"
              value={form.year}
              onChange={(value) => setForm({ ...form, year: value })}
            />
            <Field
              label="Thể loại"
              value={form.genre}
              onChange={(value) => setForm({ ...form, genre: value })}
            />
            <Field
              label="Diễn viên"
              value={form.cast}
              onChange={(value) => setForm({ ...form, cast: value })}
              wide
            />
            <label className="text-sm font-semibold sm:col-span-2">
              Mô tả
              <textarea
                value={form.synopsis}
                onChange={(event) =>
                  setForm({ ...form, synopsis: event.target.value })
                }
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
              />
            </label>
            <label className="text-sm font-semibold">
              Trạng thái
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
              >
                <option>Đang chiếu</option>
                <option>Bản nháp</option>
              </select>
            </label>
          </div>
          <Actions cancel={() => setEditing(null)} save={save} />
        </Modal>
      )}
      {viewing && (
        <Modal title={viewing.name} close={() => setViewing(null)}>
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Phim dài · {viewing.year}
            </p>
            <h3 className="mt-2 text-2xl font-bold">{viewing.name}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {contentMetadataLabels(metadata, `movie:${viewing.id}`)?.genres ??
                viewing.genre}{" "}
              · Diễn viên:{" "}
              {contentMetadataLabels(metadata, `movie:${viewing.id}`)?.actors ??
                viewing.cast}
            </p>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              {viewing.synopsis}
            </p>
            <button className="mt-5 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white">
              <Play size={16} fill="currentColor" /> Xem bản phát thử
            </button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal title="Xác nhận xóa phim?" close={() => setDeleting(null)}>
          <p className="text-sm leading-6 text-slate-500">
            Bạn sắp xóa{" "}
            <strong className="text-slate-900">{deleting.name}</strong>. Dữ liệu
            này không thể khôi phục.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500"
            >
              Hủy
            </button>
            <button
              onClick={remove}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white"
            >
              Xóa phim
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
      />
    </label>
  );
}
function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`m-auto flex w-full flex-col rounded-lg bg-white p-6 shadow-2xl ${wide ? 'max-w-[48rem]' : 'max-w-xl'}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          <button
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
function Actions({ cancel, save }: { cancel: () => void; save: () => void }) {
  return (
    <div className="mt-auto flex justify-end gap-3 pt-6">
      <button
        onClick={cancel}
        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500"
      >
        Hủy
      </button>
      <button
        onClick={save}
        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
      >
        Lưu phim
      </button>
    </div>
  );
}
