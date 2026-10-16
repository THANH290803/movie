"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AdminStatusBadge } from "@/components/common/admin-status-badge";
import { AdminTablePagination } from "@/components/common/admin-table-pagination";
import { useAdminTablePagination } from "@/hooks/use-admin-table-pagination";

import type { UserRow } from "@/features/users/types/user";
import { mockUsers } from "@/features/users/data/mock-users";

type UserForm = Pick<UserRow, "name" | "email" | "plan" | "status">;

const emptyForm: UserForm = {
  name: "",
  email: "",
  plan: "Free",
  status: "Hoạt động",
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>(mockUsers);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  const visibleRows = useMemo(
    () =>
      rows.filter((row) =>
        `${row.name} ${row.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  const {
    rows: paginatedUsers,
    page,
    pageSize,
    setPage,
    changePageSize,
    resetPage,
  } = useAdminTablePagination(visibleRows);
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };
  const openEdit = (row: UserRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      plan: row.plan,
      status: row.status,
    });
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };
  const saveUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) return;
    if (editing)
      setRows((current) =>
        current.map((row) =>
          row.id === editing.id ? { ...row, ...form, name, email } : row,
        ),
      );
    else
      setRows((current) => [
        ...current,
        {
          ...form,
          name,
          email,
          id: Date.now(),
          joined: new Date().toLocaleDateString("vi-VN"),
        },
      ]);
    closeForm();
  };
  const removeUser = () => {
    if (!deleting) return;
    setRows((current) => current.filter((row) => row.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="TÀI KHOẢN"
        title="Người dùng"
        description="Quản lý tài khoản, gói dịch vụ và trạng thái hoạt động."
        action={
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
          >
            <Plus size={17} /> Thêm người dùng
          </button>
        }
      />
      <div className="admin-table-toolbar admin-table-toolbar--external">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400"
          />
        </div>
        <p className="text-sm text-slate-500">{visibleRows.length} tài khoản</p>
      </div>
      <div className="admin-table-card admin-table-card--continued">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <caption className="sr-only">Danh sách người dùng</caption>
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Tài khoản",
                  "Gói dịch vụ",
                  "Ngày tham gia",
                  "Trạng thái",
                  "Thao tác",
                ].map((label) => (
                  <th scope="col" className="px-3 py-4" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((row) => (
                <tr
                  className="border-b border-slate-50 last:border-0"
                  key={row.id}
                >
                  <td className="px-3 py-4">
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                  </td>
                  <td className="px-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.plan === "Premium" ? "bg-violet-50 text-violet-600" : "bg-slate-100 text-slate-600"}`}
                    >
                      {row.plan}
                    </span>
                  </td>
                  <td className="px-3 text-slate-500">{row.joined}</td>
                  <td className="px-3">
                    <AdminStatusBadge
                      tone={row.status === "Hoạt động" ? "success" : "danger"}
                    >
                      {row.status}
                    </AdminStatusBadge>
                  </td>
                  <td className="px-3">
                    <button
                      onClick={() => openEdit(row)}
                      aria-label={`Sửa ${row.name}`}
                      className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleting(row)}
                      aria-label={`Xóa ${row.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleRows.length === 0 && (
          <p className="admin-table-empty">
            Không tìm thấy người dùng phù hợp.
          </p>
        )}
        <AdminTablePagination
          totalItems={visibleRows.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <form
            onSubmit={saveUser}
            className="m-auto flex w-full max-w-[44rem] flex-col rounded-lg bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold tracking-[.18em] text-orange-500">
                  TÀI KHOẢN
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Đóng"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Họ và tên
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-orange-400"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-orange-400"
                  placeholder="email@example.com"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Gói dịch vụ
                  <select
                    value={form.plan}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        plan: event.target.value as UserForm["plan"],
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none"
                  >
                    <option>Free</option>
                    <option>Premium</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Trạng thái
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as UserForm["status"],
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none"
                  >
                    <option>Hoạt động</option>
                    <option>Tạm khóa</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-auto flex justify-end gap-3 pt-7">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                {editing ? "Lưu thay đổi" : "Tạo người dùng"}
              </button>
            </div>
          </form>
        </div>
      )}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold">Xóa người dùng?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Bạn chắc chắn muốn xóa{" "}
              <strong className="text-slate-800">{deleting.name}</strong>? Hành
              động này không thể hoàn tác.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={removeUser}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-600"
              >
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
