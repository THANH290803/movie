"use client";

import { useState } from "react";

export function useAdminTablePagination<T>(items: T[]) {
  const [requestedPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = items.slice((page - 1) * pageSize, page * pageSize);

  function changePageSize(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return {
    rows,
    page,
    pageSize,
    setPage,
    changePageSize,
    resetPage: () => setPage(1),
  };
}
