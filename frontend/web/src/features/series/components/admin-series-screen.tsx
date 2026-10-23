"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clapperboard,
  Edit3,
  Eye,
  Film,
  Layers3,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useMetadataStore } from "@/features/metadata/stores/metadata-store";
import { contentMetadataLabels } from "@/features/metadata/lib/metadata-rules";
import { slugify, uniqueSlug } from "@/lib/slug";

import type { Episode, Part, Series } from "@/features/series/types/series";
import { mockSeries } from "@/features/series/data/mock-series";

type FormState = {
  name: string;
  year: string;
  genre: string;
  rating: string;
  cast: string;
  synopsis: string;
};
type EpisodeForm = {
  title: string;
  duration: string;
  status: string;
  synopsis: string;
};

export default function SeriesPage() {
  const metadata = useMetadataStore();
  const router = useRouter();
  const [items, setItems] = useState(mockSeries);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [partId, setPartId] = useState(11);
  const [seriesModal, setSeriesModal] = useState<Series | "new" | null>(null);
  const [partModal, setPartModal] = useState<{
    seriesId: number;
    part?: Part;
  } | null>(null);
  const [episodeModal, setEpisodeModal] = useState<{
    seriesId: number;
    partId: number;
    episode?: Episode;
  } | null>(null);
  const [deleting, setDeleting] = useState<{
    type: "series" | "part" | "episode";
    seriesId: number;
    partId?: number;
    episodeId?: number;
    label: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    year: "2024",
    genre: "Chính kịch",
    rating: "8.0",
    cast: "",
    synopsis: "",
  });
  const [episodeForm, setEpisodeForm] = useState<EpisodeForm>({
    title: "",
    duration: "45 phút",
    status: "Bản nháp",
    synopsis: "",
  });

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0];
  const selectedPart =
    selected?.parts.find((part) => part.id === partId) ?? selected?.parts[0];
  const saveSeries = () => {
    if (!form.name.trim()) return;
    if (seriesModal === "new") {
      const created = {
        id: Date.now(),
        slug: uniqueSlug(form.name, items.map((item) => item.slug)),
        ...form,
        name: form.name.trim(),
        parts: [],
      };
      setItems((current) => [...current, created]);
      setSelectedId(created.id);
    } else if (seriesModal)
      setItems((current) =>
        current.map((item) =>
          item.id === seriesModal.id
            ? { ...item, ...form, name: form.name.trim() }
            : item,
        ),
      );
    setSeriesModal(null);
  };
  const openPart = (seriesId: number, part?: Part) => {
    setPartModal({ seriesId, part });
    setForm((current) => ({ ...current, name: part?.name ?? "" }));
  };
  const savePart = () => {
    if (!partModal || !form.name.trim()) return;
    setItems((current) =>
      current.map((item) => {
        if (item.id !== partModal.seriesId) return item;
        return partModal.part
          ? {
              ...item,
              parts: item.parts.map((part) =>
                part.id === partModal.part?.id
                  ? { ...part, name: form.name.trim() }
                  : part,
              ),
            }
          : {
              ...item,
              parts: [
                ...item.parts,
                { id: Date.now(), name: form.name.trim(), episodes: [] },
              ],
            };
      }),
    );
    setPartModal(null);
  };
  const saveEpisode = () => {
    if (!episodeModal || !episodeForm.title.trim()) return;
    setItems((current) =>
      current.map((item) =>
        item.id !== episodeModal.seriesId
          ? item
          : {
              ...item,
              parts: item.parts.map((part) => {
                if (part.id !== episodeModal.partId) return part;
                if (episodeModal.episode)
                  return {
                    ...part,
                    episodes: part.episodes.map((ep) =>
                      ep.id === episodeModal.episode?.id
                        ? {
                            ...ep,
                            ...episodeForm,
                            title: episodeForm.title.trim(),
                          }
                        : ep,
                    ),
                  };
                return {
                  ...part,
                  episodes: [
                    ...part.episodes,
                    {
                      id: Date.now(),
                      slug: uniqueSlug(episodeForm.title, item.parts.flatMap((part) => part.episodes.map((episode) => episode.slug))),
                      number: part.episodes.length + 1,
                      ...episodeForm,
                      title: episodeForm.title.trim(),
                    },
                  ],
                };
              }),
            },
      ),
    );
    setEpisodeModal(null);
  };
  const remove = () => {
    if (!deleting) return;
    setItems(
      (current) =>
        current
          .map((item) => {
            if (item.id !== deleting.seriesId) return item;
            if (deleting.type === "series") return null;
            if (deleting.type === "part")
              return {
                ...item,
                parts: item.parts.filter((part) => part.id !== deleting.partId),
              };
            return {
              ...item,
              parts: item.parts.map((part) =>
                part.id === deleting.partId
                  ? {
                      ...part,
                      episodes: part.episodes.filter(
                        (ep) => ep.id !== deleting.episodeId,
                      ),
                    }
                  : part,
              ),
            };
          })
          .filter(Boolean) as Series[],
    );
    setDeleting(null);
  };
  const totalEpisodes = (item: Series) =>
    item.parts.reduce((total, part) => total + part.episodes.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="CẤU TRÚC NỘI DUNG"
        title="Phim bộ & phần"
        description="Phim bộ có thể có nhiều phần hoặc phát hành trực tiếp theo danh sách tập."
        action={
          <Link
            href="/admin/series/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"
          >
            <Plus size={17} /> Tạo phim bộ
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm phim bộ..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setPartId(item.parts[0]?.id ?? 0);
                }}
                className={`rounded-xl p-3 text-left transition ${item.id === selected?.id ? "bg-slate-950 text-white" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-11 place-items-center rounded-xl ${item.id === selected?.id ? "bg-orange-500" : "bg-orange-50 text-orange-500"}`}
                  >
                    <Film size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p
                      className={`mt-1 text-xs ${item.id === selected?.id ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {item.parts.length ? `${item.parts.length} phần · ` : ""}
                      {totalEpisodes(item)} tập
                    </p>
                  </div>
                  <ChevronDown size={16} className="-rotate-90 opacity-40" />
                </div>
              </button>
            ))}
          </div>
        </section>
        {selected ? (
          <section className="min-w-0">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex flex-col justify-between gap-5 sm:flex-row">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400">
                    <Clapperboard size={15} /> Thông tin phim bộ
                  </div>
                  <h2 className="text-3xl font-bold">{selected.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {selected.year} ·{" "}
                    {contentMetadataLabels(metadata, `series:${selected.id}`)
                      ?.genres ?? selected.genre}{" "}
                    · IMDb {selected.rating}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/series/${selected.slug}`}
                    className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-white/10"
                    aria-label="Xem chi tiết phim"
                  >
                    <Eye size={17} />
                  </Link>
                  <Link
                    href={`/admin/series/${selected.slug}/edit`}
                    className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-white/10"
                    aria-label="Sửa thông tin phim"
                  >
                    <Edit3 size={17} />
                  </Link>
                  <button
                    onClick={() =>
                      setDeleting({
                        type: "series",
                        seriesId: selected.id,
                        label: selected.name,
                      })
                    }
                    className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-red-500/20 hover:text-red-300"
                    aria-label="Xóa phim"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">
                {selected.synopsis || "Chưa có mô tả cho phim bộ này."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Diễn viên: {selected.cast || "Chưa cập nhật"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {selected.parts.length} phần
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {totalEpisodes(selected)} tập
                </span>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold">Cấu trúc phát hành</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Quản lý phần và tập trong cùng một màn hình.
                  </p>
                </div>
                <button
                  onClick={() => openPart(selected.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold hover:border-orange-300 hover:text-orange-600"
                >
                  <Plus size={16} /> Thêm phần
                </button>
              </div>
              {selected.parts.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Layers3 className="mx-auto text-slate-300" size={28} />
                  <p className="mt-3 text-sm font-semibold">
                    Phim bộ chưa có phần
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bạn vẫn có thể thêm tập trực tiếp bằng cách tạo Phần 1.
                  </p>
                  <button
                    onClick={() => openPart(selected.id)}
                    className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white"
                  >
                    Tạo phần đầu tiên
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-3">
                  {selected.parts.map((part) => (
                    <div
                      key={part.id}
                      className={`rounded-xl border p-4 ${selectedPart?.id === part.id ? "border-orange-200 bg-orange-50/40" : "border-slate-100"}`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setPartId(part.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                            P{selected.parts.indexOf(part) + 1}
                          </span>
                          <span>
                            <span className="block text-sm font-bold">
                              {part.name}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {part.episodes.length} tập
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => openPart(selected.id, part)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-900"
                          aria-label={`Sửa ${part.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleting({
                              type: "part",
                              seriesId: selected.id,
                              partId: part.id,
                              label: part.name,
                            })
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500"
                          aria-label={`Xóa ${part.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {selectedPart?.id === part.id && (
                        <div className="mt-4 border-t border-slate-200/70 pt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Danh sách tập
                            </p>
                            <button
                              onClick={() => {
                                router.push(
                                  `/admin/series/${selected.slug}/episodes/new?part=${slugify(part.name)}`,
                                );
                              }}
                              className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                            >
                              <Plus size={14} /> Thêm tập
                            </button>
                          </div>
                          {part.episodes.length === 0 ? (
                            <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-500">
                              Chưa có tập phim. Hãy thêm tập đầu tiên.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {part.episodes.map((ep) => (
                                <div
                                  key={ep.id}
                                  className="flex items-center gap-3 rounded-lg bg-white p-3"
                                >
                                  <span className="grid size-8 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                                    {String(ep.number).padStart(2, "0")}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                      {ep.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {ep.duration} · {ep.status}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/series/${selected.slug}/episodes/${ep.slug}/edit?part=${slugify(part.name)}`,
                                      );
                                    }}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                    aria-label={`Sửa tập ${ep.number}`}
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleting({
                                        type: "episode",
                                        seriesId: selected.id,
                                        partId: part.id,
                                        episodeId: ep.id,
                                        label: `Tập ${ep.number}`,
                                      })
                                    }
                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                    aria-label={`Xóa tập ${ep.number}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                  <button
                                    className="rounded-lg bg-orange-50 p-2 text-orange-500 hover:bg-orange-100"
                                    aria-label={`Xem tập ${ep.number}`}
                                  >
                                    <Play size={14} fill="currentColor" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
            Không tìm thấy phim bộ phù hợp.
          </div>
        )}
      </div>
      {seriesModal && (
        <Modal
          wide
          title={
            seriesModal === "new" ? "Tạo phim bộ" : "Chỉnh sửa thông tin phim"
          }
          close={() => setSeriesModal(null)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Tên phim bộ"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              placeholder="Ví dụ: Stranger Things"
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
              label="Điểm đánh giá"
              value={form.rating}
              onChange={(value) => setForm({ ...form, rating: value })}
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
                placeholder="Tóm tắt nội dung phim..."
              />
            </label>
          </div>
          <ModalActions cancel={() => setSeriesModal(null)} save={saveSeries} />
        </Modal>
      )}
      {partModal && (
        <Modal
          title={partModal.part ? "Chỉnh sửa phần phim" : "Thêm phần phim"}
          close={() => setPartModal(null)}
        >
          <Field
            label="Tên phần"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="Ví dụ: Phần 3"
          />
          <ModalActions cancel={() => setPartModal(null)} save={savePart} />
        </Modal>
      )}
      {episodeModal && (
        <Modal
          wide
          title={episodeModal.episode ? "Chỉnh sửa tập phim" : "Thêm tập phim"}
          close={() => setEpisodeModal(null)}
        >
          <div className="flex flex-col gap-4">
            <Field
              label="Tên tập"
              value={episodeForm.title}
              onChange={(value) =>
                setEpisodeForm({ ...episodeForm, title: value })
              }
              placeholder="Ví dụ: Ngày mới"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Thời lượng"
                value={episodeForm.duration}
                onChange={(value) =>
                  setEpisodeForm({ ...episodeForm, duration: value })
                }
              />
              <label className="text-sm font-semibold">
                Trạng thái
                <select
                  value={episodeForm.status}
                  onChange={(event) =>
                    setEpisodeForm({
                      ...episodeForm,
                      status: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
                >
                  <option>Đã xuất bản</option>
                  <option>Bản nháp</option>
                </select>
              </label>
            </div>
            <label className="text-sm font-semibold">
              Mô tả tập
              <textarea
                value={episodeForm.synopsis}
                onChange={(event) =>
                  setEpisodeForm({
                    ...episodeForm,
                    synopsis: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
              />
            </label>
          </div>
          <ModalActions
            cancel={() => setEpisodeModal(null)}
            save={saveEpisode}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          title={`Xóa ${deleting.label}?`}
          close={() => setDeleting(null)}
          danger
        >
          <p className="text-sm leading-6 text-slate-500">
            Bạn sắp xóa{" "}
            <strong className="text-slate-900">{deleting.label}</strong>. Dữ
            liệu liên quan sẽ bị xóa và không thể khôi phục.
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
              Xác nhận xóa
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
  danger,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  danger?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/50 p-4"
      role="presentation"
    >
      <div
        role={danger ? "alertdialog" : "dialog"}
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
function ModalActions({
  cancel,
  save,
}: {
  cancel: () => void;
  save: () => void;
}) {
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
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
      >
        <Check size={16} /> Lưu thay đổi
      </button>
    </div>
  );
}
