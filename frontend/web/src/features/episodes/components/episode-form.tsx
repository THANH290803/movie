"use client";

import Link from "next/link";
import { ArrowLeft, FileVideo, Save, Upload } from "lucide-react";
import { useState } from "react";
import { PageHeader } from '@/components/common/page-header'

export default function EpisodeForm({
  mode,
  seriesId,
  partId,
  episodeId,
}: {
  mode: "create" | "edit";
  seriesId: string;
  partId?: string;
  episodeId?: string;
}) {
  const [title, setTitle] = useState(mode === "edit" ? "Khi ta lạc lối" : "");
  const [video, setVideo] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="PHIM BỘ / TẬP PHIM"
        title={mode === "create" ? "Thêm tập phim" : "Chỉnh sửa tập phim"}
        description="Mỗi tập là một nội dung độc lập, có video, phụ đề, thumbnail và metadata riêng."
        action={
          <Link
            href={`/admin/series/${seriesId}`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Quay lại phim bộ
          </Link>
        }
      />
      {saved && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Đã lưu tập phim thành công.
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
      >
        <main className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-500">
                <FileVideo size={19} />
              </span>
              <div>
                <h2 className="font-bold">Thông tin tập</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tên tập, số thứ tự và nội dung hiển thị.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Tên tập *"
                value={title}
                onChange={setTitle}
                wide
                placeholder="Ví dụ: Ngày mới"
              />
              <Field label="Số tập" value="1" />
              <Field label="Thời lượng" value="48 phút" />
              <Field label="Trạng thái" value="Bản nháp" />
              <label className="text-sm font-semibold sm:col-span-2">
                Mô tả tập
                <textarea
                  className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
                  placeholder="Tóm tắt nội dung tập phim..."
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold">Tài nguyên tập phim</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload file trực tiếp hoặc dùng URL CDN.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <UploadBox
                label="Video tập phim *"
                value={video}
                onChange={setVideo}
                accept="MP4, MKV · tối đa 10GB"
              />
              <UploadBox
                label="Phụ đề VTT / SRT"
                value={subtitle}
                onChange={setSubtitle}
                accept="Tối đa 50MB"
              />
            </div>
            <label className="mt-5 block text-sm font-semibold">
              URL phát dự phòng
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
                placeholder="https://cdn.example.com/episode.m3u8"
              />
            </label>
          </section>
          <div className="flex justify-end gap-3">
            <Link
              href={`/admin/series/${seriesId}`}
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500"
            >
              Hủy
            </Link>
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200">
              <Save size={16} /> Lưu tập phim
            </button>
          </div>
        </main>
        <aside className="rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
            Luồng nội dung
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Phim bộ: {seriesId} ·{" "}
            {partId ? `Phần: ${partId}` : "Không chia phần"}
            {episodeId ? ` · Tập: ${episodeId}` : ""}
          </p>
          <button
            type="button"
            className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"
          >
            <Upload size={16} /> Chọn file từ máy
          </button>
        </aside>
      </form>
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
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
      />
    </label>
  );
}
function UploadBox({
  label,
  value,
  onChange,
  accept,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept: string;
}) {
  return (
    <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-5 hover:border-orange-300">
      <Upload size={20} className="text-orange-400" />
      <strong className="mt-3 block text-sm">{value || label}</strong>
      <span className="mt-1 block text-xs text-slate-500">{accept}</span>
      <input
        type="file"
        className="sr-only"
        accept={label.includes("Video") ? "video/*" : ".srt,.vtt"}
        onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
      />
    </label>
  );
}
