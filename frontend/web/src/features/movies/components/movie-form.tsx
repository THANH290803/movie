"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clapperboard,
  FileVideo,
  ImagePlus,
  Play,
  Save,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { ContentMetadataFields } from "@/features/metadata/components/content-metadata-fields";
import { useContentMetadata } from "@/features/metadata/hooks/use-content-metadata";
import { mockMovies } from "@/features/movies/data/mock-movies";

type MovieFormProps = { mode: "create" | "edit"; movieId?: string };

export function MovieForm({ mode, movieId }: MovieFormProps) {
  const metadata = useContentMetadata(
    "movie",
    mode === "edit" ? movieId : undefined,
  );
  const [saveError, setSaveError] = useState("");
  const [poster, setPoster] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(
    mode === "edit"
      ? (mockMovies.find((movie) => String(movie.id) === movieId)?.name ?? "")
      : "",
  );

  return (
    <>
      <PageHeader
        eyebrow="KHO PHIM / PHIM DÀI"
        title={mode === "create" ? "Thêm phim dài" : "Chỉnh sửa phim dài"}
        description="Phim dài là nội dung có một tập duy nhất. Điền đủ thông tin để xuất bản chuyên nghiệp."
        action={
          <Link
            href="/admin/movies"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Quay lại kho phim
          </Link>
        }
      />
      {saved && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Đã lưu thay đổi phim. Bạn có thể tiếp tục xem trước hoặc xuất bản.
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
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <SectionTitle
              icon={Clapperboard}
              title="Thông tin cơ bản"
              description="Thông tin khán giả sẽ nhìn thấy trên trang xem phim."
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Tên phim *"
                value={title}
                onChange={setTitle}
                placeholder="Ví dụ: Interstellar"
                wide
              />
              <Field label="Tên gốc" placeholder="Original title" />
              <Field label="Năm phát hành" value="2024" />
              <Field label="Thời lượng" placeholder="Ví dụ: 2 giờ 46 phút" />
              <ContentMetadataFields
                value={metadata.selection}
                onChange={(next) => {
                  metadata.setSelection(next);
                  setSaved(false);
                  setSaveError("");
                }}
              />
              <label className="text-sm font-semibold sm:col-span-2">
                Mô tả phim
                <textarea
                  className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400"
                  placeholder="Tóm tắt nội dung, bối cảnh và điểm hấp dẫn của phim..."
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <SectionTitle
              icon={FileVideo}
              title="Tập phim duy nhất"
              description="Upload video, phụ đề và chọn trạng thái phát hành."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <UploadBox
                label="Video phim *"
                accept="Video MP4, MKV tối đa 10GB"
                value={videoName}
                onChange={(name, url) => {
                  setVideoName(name);
                  setVideoUrl(url);
                }}
              />
              <UploadBox
                label="Phụ đề tiếng Việt"
                accept="VTT hoặc SRT tối đa 50MB"
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="URL phát dự phòng"
                placeholder="https://cdn.example.com/movie.m3u8"
              />
              <SelectField
                label="Trạng thái"
                options={["Bản nháp", "Lên lịch", "Đã xuất bản"]}
              />
            </div>
          </section>
          <div className="flex justify-end gap-3">
            <Link
              href="/admin/movies"
              className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"
            >
              <Save size={16} /> Lưu phim
            </button>
          </div>
        </div>
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold">Ảnh poster</h3>
            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG hoặc WebP · tỷ lệ 2:3
            </p>
            <label className="mt-4 grid aspect-[2/3] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-orange-300">
              {poster ? (
                <Image
                  src={poster}
                  width={320}
                  height={480}
                  unoptimized
                  alt="Poster xem trước"
                  className="size-full object-cover"
                />
              ) : (
                <span>
                  <ImagePlus className="mx-auto text-orange-400" />
                  <strong className="mt-3 block text-sm">Tải ảnh poster</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    Kéo thả hoặc chọn file
                  </span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setPoster(URL.createObjectURL(file));
                }}
              />
            </label>
          </section>
          <section className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Xem trước
            </p>
            <h3 className="mt-3 text-xl font-bold">
              {title || "Tên phim của bạn"}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              2024 · Phim dài · 01 tập
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold"
            >
              <Play size={15} fill="currentColor" /> Xem thử trong admin
            </button>
          </section>
        </aside>
      </form>
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem trước phim"
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Xem trước phim
                </p>
                <h2 className="mt-1 font-bold text-slate-900">
                  {title || "Phim chưa đặt tên"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Đóng xem trước"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-950 p-5">
              {videoUrl ? (
                <video
                  controls
                  autoPlay
                  className="aspect-video w-full rounded-xl bg-black"
                  src={videoUrl}
                />
              ) : (
                <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-slate-700 text-center text-sm text-slate-400">
                  <div>
                    <Play className="mx-auto mb-3 text-orange-400" />
                    <p>Chưa có video để phát</p>
                    <p className="mt-1 text-xs">
                      Hãy tải video phim lên trước.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
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

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Clapperboard;
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
function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-orange-400">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function UploadBox({
  label,
  accept,
  value,
  onChange,
}: {
  label: string;
  accept: string;
  value?: string;
  onChange?: (name: string, url: string) => void;
}) {
  return (
    <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-5 hover:border-orange-300">
      <Upload className="text-orange-400" size={20} />
      <strong className="mt-3 block text-sm">{value || label}</strong>
      <span className="mt-1 block text-xs text-slate-500">{accept}</span>
      <input
        type="file"
        className="sr-only"
        accept={label.includes("Video") ? "video/*" : ".srt,.vtt"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange?.(file.name, URL.createObjectURL(file));
        }}
      />
    </label>
  );
}
export default MovieForm;
