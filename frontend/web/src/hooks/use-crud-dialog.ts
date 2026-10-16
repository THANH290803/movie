"use client";

import { useState } from "react";

export function useCrudDialog<T>() {
  const [selected, setSelected] = useState<T | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "delete" | null>(null);
  return {
    selected,
    mode,
    open: (nextMode: "create" | "edit" | "delete", item: T | null = null) => {
      setSelected(item);
      setMode(nextMode);
    },
    close: () => {
      setSelected(null);
      setMode(null);
    },
  };
}
