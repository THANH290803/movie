"use client";

import { useEffect, useId, useState } from "react";
import type { ComponentProps } from 'react';
import { X, AlertTriangle } from "lucide-react";

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "select";
  options?: string[];
};

export function CrudDialog(props: ComponentProps<typeof CrudDialogContent>) {
  return props.open ? <CrudDialogContent key={JSON.stringify(props.initialValues ?? {})} {...props} /> : null;
}

function CrudDialogContent({
  open,
  title,
  description,
  fields,
  initialValues = {},
  submitLabel = "Lưu thay đổi",
  danger,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  fields?: Field[];
  initialValues?: Record<string, string>;
  submitLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`m-auto flex w-full flex-col rounded-lg bg-white p-6 shadow-2xl ${danger ? 'max-w-lg' : 'max-w-[44rem]'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-slate-950">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        {danger && (
          <div className="mt-5 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <p>
              Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
            </p>
          </div>
        )}
        {fields && (
          <div className="mt-6 flex flex-col gap-4">
            {fields.map((field) => (
              <label
                key={field.name}
                className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
              >
                {field.label}
                {field.type === "select" ? (
                  <select
                    value={values[field.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.name]: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-orange-400"
                  >
                    <option value="">Chọn {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setValues({ ...values, [field.name]: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-orange-400"
                  />
                )}
              </label>
            ))}
          </div>
        )}
        <div className="mt-auto flex justify-end gap-3 pt-7">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit?.(values)}
            className={`rounded-xl px-5 py-3 text-sm font-bold text-white ${danger ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}
          >
            {submitLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export type { Field };
