"use client";

import { useId } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const pageSizes = [10, 25, 50, 100];
const buttonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40";

export function AdminTablePagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const selectId = useId();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstRow = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalItems);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages - firstVisiblePage + 1) },
    (_, index) => firstVisiblePage + index,
  );
  return (
    <div className="admin-table-pagination">
      <span aria-live="polite" className="whitespace-nowrap text-slate-500">
        {firstRow}–{lastRow} / {totalItems}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="whitespace-nowrap">
            Số dòng/trang
          </label>
          <select
            id={selectId}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-orange-400"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <nav aria-label="Phân trang bảng" className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-label="Trang đầu"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className={buttonClass}
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={buttonClass}
          >
            <ChevronLeft size={16} />
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-label={`Trang ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`${buttonClass} ${pageNumber === currentPage ? "border-orange-500 bg-orange-50 font-bold text-orange-600" : ""}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            aria-label="Trang sau"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={buttonClass}
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            aria-label="Trang cuối"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={buttonClass}
          >
            <ChevronsRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}
