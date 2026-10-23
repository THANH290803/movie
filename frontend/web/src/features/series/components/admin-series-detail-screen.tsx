"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Edit3, Play, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useMetadataStore } from "@/features/metadata/stores/metadata-store";
import { contentMetadataLabels } from "@/features/metadata/lib/metadata-rules";
import type { Series } from "@/features/series/types/series";
import type { Episode as SeriesEpisode } from "@/features/series/types/series";

const previewVideo =
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";

type PreviewEpisode = SeriesEpisode & { partName: string };

export default function SeriesDetailPage({ series }: { series: Series }) {
  const state = useMetadataStore();
  const labels = contentMetadataLabels(state, `series:${series.id}`);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const episodes: PreviewEpisode[] = series.parts.flatMap((part) =>
    part.episodes.map((episode) => ({ ...episode, partName: part.name })),
  );

  return (
    <>
      <PageHeader
        eyebrow="PHIM BỘ / CHI TIẾT"
        title={series.name}
        description="Quản lý thông tin phim bộ, phần và tập trên một luồng chuyên nghiệp."
        action={
          <Link
            href="/admin/series"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>
        }
      />
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl bg-slate-950 p-7 text-white">
          <div className="flex flex-col justify-between gap-5 md:flex-row">
            <div>
              <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold">
                PHIM BỘ
              </span>
              <h2 className="mt-4 text-3xl font-bold">{series.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {series.year} · {labels?.genres || "Chưa chọn thể loại"} · IMDb{" "}
                {series.rating}
              </p>
            </div>
            <Link
              href={`/admin/series/${series.slug}/edit`}
              className="flex h-fit items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold"
            >
              <Edit3 size={16} /> Sửa phim bộ
            </Link>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            {series.synopsis}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Đạo diễn: {labels?.directors || "Chưa chọn"} · Diễn viên:{" "}
            {labels?.actors || "Chưa chọn"}
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Danh sách tập</h2>
              <p className="mt-1 text-sm text-slate-500">
                Có thể thêm tập trực tiếp hoặc tổ chức theo nhiều phần.
              </p>
            </div>
            <Link
              href={`/admin/series/${series.slug}/episodes/new`}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white"
            >
              <Plus size={16} /> Thêm tập
            </Link>
          </div>
          {episodes.length > 0 ? (
            <div className="mt-6 flex flex-col gap-3">
              {episodes.map((episode) => (
                <Episode
                  key={episode.id}
                  episode={episode}
                  seriesSlug={series.slug}
                  onPlay={() => setSelectedEpisodeId(episode.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Phim bộ này chưa có tập nào.</p>
          )}
        </section>
      </div>
      {selectedEpisodeId !== null && (
        <VideoModal
          episodes={episodes}
          selectedEpisodeId={selectedEpisodeId}
          onSelect={setSelectedEpisodeId}
          onClose={() => setSelectedEpisodeId(null)}
        />
      )}
    </>
  );
}

function Episode({ episode, seriesSlug, onPlay }: { episode: PreviewEpisode; seriesSlug: string; onPlay: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center">
      <div className="grid size-12 place-items-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
        {String(episode.number).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {episode.partName} · {episode.duration}
        </p>
        <p className="mt-1 font-bold">{episode.title}</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/admin/series/${seriesSlug}/episodes/${episode.slug}/edit`}
          aria-label={`Sửa ${episode.title}`}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
        >
          <Edit3 size={14} />
        </Link>
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Xem video ${episode.title}`}
          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-orange-500"
        >
          <Play size={14} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function VideoModal({ episodes, selectedEpisodeId, onSelect, onClose }: {
  episodes: PreviewEpisode[];
  selectedEpisodeId: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const selectedIndex = episodes.findIndex((episode) => episode.id === selectedEpisodeId);
  const selectedEpisode = episodes[selectedIndex];
  if (!selectedEpisode) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h2 id="video-title" className="truncate font-bold">{selectedEpisode.title}</h2>
            <p className="text-xs text-slate-400">{selectedEpisode.partName} · Tập {selectedEpisode.number} · Bản xem trước</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng trình phát" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:overflow-hidden">
          <div className="min-w-0">
            <VideoPreview key={selectedEpisode.id} episode={selectedEpisode} />
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <button
                type="button"
                disabled={selectedIndex === 0}
                onClick={() => onSelect(episodes[selectedIndex - 1].id)}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Tập trước
              </button>
              <span className="text-xs text-slate-400">{selectedIndex + 1} / {episodes.length}</span>
              <button
                type="button"
                disabled={selectedIndex === episodes.length - 1}
                onClick={() => onSelect(episodes[selectedIndex + 1].id)}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tập sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <aside className="min-h-0 border-t border-white/10 lg:flex lg:flex-col lg:border-l lg:border-t-0">
            <div className="border-b border-white/10 px-4 py-4">
              <h3 className="text-sm font-bold">Danh sách tập</h3>
              <p className="mt-1 text-xs text-slate-400">Chọn tập để xem ngay tại đây.</p>
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto p-2 lg:max-h-none lg:flex-1">
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  type="button"
                  onClick={() => onSelect(episode.id)}
                  aria-pressed={episode.id === selectedEpisodeId}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${episode.id === selectedEpisodeId ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-white/10"}`}
                >
                  <span className="w-6 shrink-0 font-bold">{String(episode.number).padStart(2, "0")}</span>
                  <span className="min-w-0"><span className="block truncate font-semibold">{episode.title}</span><span className={`mt-1 block text-xs ${episode.id === selectedEpisodeId ? "text-orange-100" : "text-slate-500"}`}>{episode.partName} · {episode.duration}</span></span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ episode }: { episode: PreviewEpisode }) {
  const [videoError, setVideoError] = useState(false);
  return (
    <div>
      {videoError ? (
        <div className="grid aspect-video place-items-center bg-slate-900 p-8 text-center text-white">
          <div>
            <Play className="mx-auto mb-4 text-orange-400" size={38} fill="currentColor" />
            <h3 className="text-lg font-bold">Chưa có video preview khả dụng</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Không thể phát bản xem trước của {episode.title}. Hãy kiểm tra URL video của tập này.</p>
          </div>
        </div>
      ) : (
        <video className="aspect-video w-full bg-black" controls autoPlay src={previewVideo} onError={() => setVideoError(true)}>
          Trình duyệt không hỗ trợ phát video.
        </video>
      )}
    </div>
  );
}
