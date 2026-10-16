"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, Play, Film, UserRound } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useMetadataStore } from "@/features/metadata/stores/metadata-store";
import { contentMetadataLabels } from "@/features/metadata/lib/metadata-rules";
import { useParams } from "next/navigation";
import { mockMovies } from "@/features/movies/data/mock-movies";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const state = useMetadataStore();
  const movie =
    mockMovies.find((item) => String(item.id) === id) ?? mockMovies[0];
  const labels = contentMetadataLabels(state, `movie:${id}`);
  return (
    <>
      <PageHeader
        eyebrow="KHO PHIM / CHI TIẾT"
        title={movie.name}
        description="Thông tin đầy đủ, tài nguyên phát và bản xem trước của phim dài."
        action={
          <Link
            href="/admin/movies"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Quay lại kho phim
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl bg-slate-950 text-white">
            <div className="grid gap-6 p-7 md:grid-cols-[220px_1fr]">
              <div className="grid aspect-[2/3] place-items-center rounded-2xl bg-gradient-to-br from-orange-400 via-amber-700 to-slate-900">
                <Film size={54} className="text-white/70" />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-orange-500 px-3 py-1.5">
                    PHIM DÀI
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5">
                    {movie.status}
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-bold">{movie.name}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {movie.year} · Phim dài ·{" "}
                  {labels?.genres || "Chưa chọn thể loại"}
                </p>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300">
                  {movie.synopsis}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/movies/${id}/edit`}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold"
                  >
                    <Edit3 size={16} /> Chỉnh sửa phim
                  </Link>
                  <button className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold">
                    <Play size={16} fill="currentColor" /> Xem thử
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold">Thông tin ê-kíp</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Đạo diễn"
                value={labels?.directors || "Chưa chọn đạo diễn"}
              />
              <Info
                label="Diễn viên"
                value={labels?.actors || "Chưa chọn diễn viên"}
              />
              <Info label="Ngôn ngữ" value="English · Phụ đề tiếng Việt" />
              <Info label="Ngày phát hành" value="01/03/2024" />
            </div>
          </section>
        </main>
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold">Tài nguyên phát</h2>
            <div className="mt-5 flex flex-col gap-4">
              <Resource label="Video phim" value="dune-part-two-1080p.mp4" />
              <Resource label="Phụ đề" value="dune-vi.vtt" />
              <Resource label="Phát dự phòng" value="Đã cấu hình CDN" />
            </div>
          </section>
          <section className="rounded-2xl bg-orange-50 p-6">
            <UserRound className="text-orange-500" size={22} />
            <p className="mt-3 text-sm font-bold">Hiệu suất nội dung</p>
            <p className="mt-1 text-sm text-slate-600">
              12.4K lượt xem · 94% hoàn thành
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
function Resource({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
