"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Film,
  ImagePlus,
  Layers3,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { ContentMetadataFields } from "@/features/metadata/components/content-metadata-fields";
import { useContentMetadata } from "@/features/metadata/hooks/use-content-metadata";
import { mockSeries } from "@/features/series/data/mock-series";

type SeriesFormProps = { mode: "create" | "edit"; seriesId?: string };
type EpisodeDraft = {
  title: string;
  duration: string;
  video: string;
  videoName: string;
};
type PartDraft = { name: string; episodes: EpisodeDraft[] };

export default function SeriesForm({ mode, seriesId }: SeriesFormProps) {
  const metadata = useContentMetadata(
    "series",
    mode === "edit" ? seriesId : undefined,
  );
  const [saveError, setSaveError] = useState("");
  const [title, setTitle] = useState(
    mode === "edit"
      ? (mockSeries.find((movie) => String(movie.id) === seriesId)?.name ?? "")
      : "",
  );
  const [hasParts, setHasParts] = useState(mode === "edit");
  const [poster, setPoster] = useState<string | null>(null);
  const [parts, setParts] = useState<PartDraft[]>([
    {
      name: "Phần 1",
      episodes: [
        {
          title: "Khi ta lạc lối",
          duration: "48 phút",
          video: "",
          videoName: "",
        },
      ],
    },
  ]);
  const [saved, setSaved] = useState(false);
  const [previewEpisode, setPreviewEpisode] = useState<EpisodeDraft | null>(
    null,
  );

  const addPart = () =>
    setParts((current) => [
      ...current,
      { name: `Phần ${current.length + 1}`, episodes: [] },
    ]);
  const addDirectEpisode = () =>
    setParts((current) => {
      const directPart = current[0] ?? { name: "Tập trực tiếp", episodes: [] };
      return [
        {
          ...directPart,
          name: "Tập trực tiếp",
          episodes: [
            ...directPart.episodes,
            { title: "", duration: "45 phút", video: "", videoName: "" },
          ],
        },
      ];
    });
  const addEpisode = (index: number) =>
    setParts((current) =>
      current.map((part, i) =>
        i === index
          ? {
              ...part,
              episodes: [
                ...part.episodes,
                { title: "", duration: "45 phút", video: "", videoName: "" },
              ],
            }
          : part,
      ),
    );
  const updateEpisode = (
    partIndex: number,
    episodeIndex: number,
    patch: Partial<EpisodeDraft>,
  ) =>
    setParts((current) =>
      current.map((part, i) =>
        i === partIndex
          ? {
              ...part,
              episodes: part.episodes.map((episode, j) =>
                j === episodeIndex ? { ...episode, ...patch } : episode,
              ),
            }
          : part,
      ),
    );
  const removeEpisode = (partIndex: number, episodeIndex: number) =>
    setParts((current) =>
      current.map((part, i) =>
        i === partIndex
          ? {
              ...part,
              episodes: part.episodes.filter((_, j) => j !== episodeIndex),
            }
          : part,
      ),
    );

  return (
    <>
      <PageHeader
        eyebrow="PHIM BỘ & TẬP"
        title={mode === "create" ? "Thêm phim bộ" : "Chỉnh sửa phim bộ"}
        description="Phim bộ có thể tổ chức theo phần, hoặc phát hành trực tiếp nhiều tập không cần phần."
        action={
          <Link
            href="/admin/series"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        }
      />
      {saved && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Đã lưu phim bộ và cấu trúc tập.
        </div>
      )}
      {saveError && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {saveError}
        </p>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const result = metadata.save(title);
          if (!result.ok) {
            setSaveError(result.error);
            setSaved(false);
            return;
          }
          setSaveError("");
          setSaved(true);
        }}
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
      >
        <main className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <Title
              icon={Film}
              title="Thông tin phim bộ"
              description="Thông tin chung áp dụng cho toàn bộ các tập."
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Tên phim bộ *"
                value={title}
                onChange={setTitle}
                wide
                placeholder="Ví dụ: Stranger Things"
              />
              <Field label="Tên gốc" placeholder="Original title" />
              <Field label="Năm phát hành" value="2024" />
              <Field label="Điểm đánh giá" placeholder="8.5" />
              <ContentMetadataFields
                value={metadata.selection}
                onChange={(next) => {
                  metadata.setSelection(next);
                  setSaved(false);
                  setSaveError("");
                }}
              />
              <label className="text-sm font-semibold sm:col-span-2">
                Mô tả
                <textarea
                  className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
                  placeholder="Mô tả nội dung, nhân vật và bối cảnh..."
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <Title
                icon={Layers3}
                title="Cấu trúc tập phim"
                description={
                  hasParts
                    ? "Đang dùng nhiều phần, mỗi phần có danh sách tập riêng."
                    : "Đang dùng danh sách tập trực tiếp, không cần tạo phần."
                }
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={hasParts}
                  onChange={(event) => setHasParts(event.target.checked)}
                  className="size-4 accent-orange-500"
                />{" "}
                Có phần
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              {parts.map((part, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      value={hasParts ? part.name : "Tập trực tiếp"}
                      disabled={!hasParts}
                      onChange={(event) =>
                        setParts((current) =>
                          current.map((item, i) =>
                            i === index
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-orange-400 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-400">
                      {part.episodes.length} tập
                    </span>
                    {hasParts && (
                      <button
                        type="button"
                        onClick={() =>
                          setParts((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Xóa phần"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {part.episodes.map((episode, episodeIndex) => (
                      <div
                        key={episodeIndex}
                        className="grid items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:grid-cols-[40px_minmax(0,1fr)_150px_40px] sm:p-4"
                      >
                        <span className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 shadow-sm">
                          {episodeIndex + 1}
                        </span>
                        <div className="flex min-w-0 flex-col gap-2.5">
                          <div>
                            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Tên tập
                            </span>
                            <input
                              value={episode.title}
                              onChange={(event) =>
                                updateEpisode(index, episodeIndex, {
                                  title: event.target.value,
                                })
                              }
                              placeholder="Ví dụ: Tập 1 — Khởi đầu"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                          <label className="flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-600">
                            <Upload size={14} className="shrink-0" />
                            <span className="truncate">
                              {episode.videoName || "Tải video tập lên"}
                            </span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              className="sr-only"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file)
                                  updateEpisode(index, episodeIndex, {
                                    video: URL.createObjectURL(file),
                                    videoName: file.name,
                                  });
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setPreviewEpisode({ ...episode });
                            }}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                            aria-label={`Xem video ${episode.title || `tập ${episodeIndex + 1}`}`}
                          >
                            <Play size={14} fill="currentColor" /> Xem video
                          </button>
                        </div>
                        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          <span className="mb-1.5 block">Thời lượng</span>
                          <input
                            value={episode.duration}
                            onChange={(event) =>
                              updateEpisode(index, episodeIndex, {
                                duration: event.target.value,
                              })
                            }
                            placeholder="45 phút"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setPreviewEpisode({ ...episode });
                          }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                          aria-label={`Xem video ${episode.title || `tập ${episodeIndex + 1}`}`}
                        >
                          <Play size={14} fill="currentColor" /> Xem video
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEpisode(index, episodeIndex)}
                          className="mt-5 grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="Xóa tập"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      hasParts ? addEpisode(index) : addDirectEpisode()
                    }
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    <Plus size={16} />{" "}
                    {hasParts ? "Thêm tập vào phần này" : "Thêm tập mới"}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={hasParts ? addPart : addDirectEpisode}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/40 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50"
              >
                <Plus size={16} /> {hasParts ? "Thêm phần mới" : "Thêm tập mới"}
              </button>
            </div>
          </section>
        </main>
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <Title
              icon={ImagePlus}
              title="Ảnh đại diện"
              description="Poster hiển thị trong danh sách phim."
            />
            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-orange-300">
              <Upload size={24} className="text-orange-400" />
              <strong className="mt-3 text-sm">
                {poster || "Tải poster lên"}
              </strong>
              <span className="mt-1 text-xs text-slate-500">
                PNG, JPG tối đa 5MB
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(event) =>
                  setPoster(event.target.files?.[0]?.name || null)
                }
              />
            </label>
          </section>
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"
            type="submit"
          >
            <Save size={17} />{" "}
            {mode === "create" ? "Tạo phim bộ" : "Lưu thay đổi"}
          </button>
        </aside>
      </form>
      {previewEpisode && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem trước video"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Xem trước tập phim
                </p>
                <h2 className="mt-1 font-bold text-slate-900">
                  {previewEpisode.title || "Tập chưa đặt tên"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEpisode(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng xem trước"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-950 p-5">
              {previewEpisode.video ? (
                <video
                  controls
                  autoPlay
                  className="aspect-video w-full rounded-xl bg-black"
                  src={previewEpisode.video}
                />
              ) : (
                <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-slate-700 text-center text-sm text-slate-400">
                  <div>
                    <Play className="mx-auto mb-3 text-orange-400" />
                    <p>Chưa có video để phát</p>
                    <p className="mt-1 text-xs">
                      Hãy tải video lên cho tập này trước.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setPreviewEpisode(null)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Title({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Film;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={19} />
      </span>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
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
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
      />
    </label>
  );
}
