"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";

const notificationOptions = [
  {
    label: "Nội dung mới được thêm",
    description: "Nhận thông báo khi phim hoặc tập mới được tạo.",
  },
  {
    label: "Người dùng mới đăng ký",
    description: "Theo dõi thành viên mới trong hệ thống.",
  },
  {
    label: "Báo cáo hoạt động hàng tuần",
    description: "Tổng hợp số liệu gửi vào mỗi thứ Hai.",
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="HỆ THỐNG"
        title="Cài đặt"
        description="Quản lý thương hiệu, thông báo và trải nghiệm vận hành Cineflow."
      />

      <div className="max-w-6xl space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Thông tin thương hiệu", "Tên, email và nhận diện"],
            ["Thông báo", "Kiểm soát cập nhật hệ thống"],
            ["Quyền truy cập", "Bảo mật không gian quản trị"],
          ].map(([title, description], index) => (
            <div
              key={title}
              className={`rounded-2xl border p-5 ${index === 0 ? "border-orange-200 bg-orange-50/70" : "border-slate-200 bg-white"}`}
            >
              <div
                className={`mb-4 flex size-10 items-center justify-center rounded-xl text-sm font-bold ${index === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                0{index + 1}
              </div>
              <h2 className="font-bold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                  Thông tin chung
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Thông tin thương hiệu
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Thông tin hiển thị trên trang quản trị và các email hệ thống.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Đang hoạt động
              </span>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Tên không gian
                <input
                  defaultValue="Cineflow Studio"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Email quản trị
                <input
                  defaultValue="admin@cineflow.vn"
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Mô tả ngắn
                <textarea
                  defaultValue="Nền tảng quản lý nội dung giải trí Cineflow."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400">
                Cập nhật lần cuối: hôm nay, 09:42
              </p>
              <button
                onClick={() => setSaved(true)}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                {saved ? "Đã lưu thay đổi" : "Lưu thay đổi"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-slate-100 pb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                Tùy chọn
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Thông báo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn những cập nhật bạn muốn nhận.
              </p>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {notificationOptions.map((option) => (
                <label
                  key={option.label}
                  className="flex cursor-pointer items-start justify-between gap-4 py-5"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {option.description}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 size-5 shrink-0 accent-orange-500"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
