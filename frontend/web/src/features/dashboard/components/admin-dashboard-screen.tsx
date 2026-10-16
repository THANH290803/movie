import { Activity, Film, FolderKanban, Play, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

const stats = [
  ["Tổng số phim", "2,482", "12.8%"],
  ["Phim bộ", "186", "8.4%"],
  ["Tổng số tập", "6,904", "18.2%"],
  ["Người dùng mới", "1,249", "24.6%"],
];
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="THỨ HAI, 14 THÁNG 10, 2024"
        title="Chào buổi sáng, Admin"
        description="Đây là tình hình thư viện phim của bạn hôm nay."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, change], i) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5"
            key={label}
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${["bg-orange-100 text-orange-600", "bg-violet-100 text-violet-600", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600"][i]}`}
              >
                {[Film, FolderKanban, Play, Users].map(
                  (Icon, j) => j === i && <Icon key={label} size={19} />,
                )}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ↑ {change}
              </span>
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="mt-1 block text-2xl font-bold">{value}</strong>
            <p className="mt-1 text-xs text-slate-400">so với tháng trước</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Tăng trưởng thư viện</h2>
              <p className="mt-1 text-sm text-slate-500">
                Số phim và tập mới trong 6 tháng gần nhất
              </p>
            </div>
            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              6 tháng ▾
            </span>
          </div>
          <div className="mt-8 flex h-64 items-end gap-3 border-b border-l border-slate-100 px-3 pb-0 sm:gap-6">
            {[42, 58, 45, 72, 63, 86, 76, 94, 81, 100, 90, 96].map(
              (height, i) => (
                <div
                  key={i}
                  className="group flex h-full flex-1 flex-col justify-end gap-1"
                >
                  <div
                    className="w-full rounded-t-md bg-orange-400 transition group-hover:bg-orange-500"
                    style={{ height: `${height}%` }}
                  />
                  <div
                    className="w-full rounded-t-md bg-slate-200"
                    style={{ height: `${Math.max(14, height - 38)}%` }}
                  />
                  <span className="mt-3 text-center text-[10px] text-slate-400">
                    {i % 2 === 1 ? `T${5 + Math.floor(i / 2)}` : ""}
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="mt-5 flex gap-5 text-xs text-slate-500">
            <span>
              <i className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400" />
              Tập phim
            </span>
            <span>
              <i className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-200" />
              Phim
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Hoạt động gần đây</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cập nhật theo thời gian thực
              </p>
            </div>
            <Activity size={18} className="text-orange-500" />
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Oppenheimer", "Đã thêm phim dài mới", "2 giờ trước"],
              ["The Last of Us · Phần 2", "Đã cập nhật tập 08", "4 giờ trước"],
              ["Nguyễn Minh Anh", "Đăng ký gói Premium", "Hôm qua"],
            ].map(([title, desc, time]) => (
              <div className="flex gap-3" key={title}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {title[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
