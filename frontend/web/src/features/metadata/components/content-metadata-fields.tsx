"use client";

import { useState } from "react";
import { MultiSelect } from "@/components/common/multi-select";
import { MetadataEditor } from "@/features/metadata/components/metadata-editor";
import { useMetadataStore } from "@/features/metadata/stores/metadata-store";
import type {
  MetadataKind,
  MetadataSelection,
} from "@/features/metadata/types/metadata";

export function ContentMetadataFields({
  value,
  onChange,
}: {
  value: MetadataSelection;
  onChange: (next: MetadataSelection) => void;
}) {
  const state = useMetadataStore();
  const [creating, setCreating] = useState<{
    kind: MetadataKind;
    name: string;
  } | null>(null);
  const definitions = [
    {
      kind: "genre",
      label: "Thể loại",
      field: "genreIds",
      options: state.genres,
      wide: true,
    },
    {
      kind: "director",
      label: "Đạo diễn",
      field: "directorIds",
      options: state.people.filter((person) =>
        person.roles.includes("director"),
      ),
      wide: true,
    },
    {
      kind: "actor",
      label: "Diễn viên",
      field: "actorIds",
      options: state.people.filter((person) => person.roles.includes("actor")),
      wide: true,
    },
  ] as const;

  return (
    <>
      {definitions.map(({ kind, label, field, options, wide }) => (
        <MultiSelect
          key={kind}
          label={label}
          options={options}
          value={value[field]}
          onChange={(ids) => onChange({ ...value, [field]: ids })}
          onCreate={(name) => setCreating({ kind, name })}
          wide={wide}
        />
      ))}
      {creating && (
        <MetadataEditor
          kind={creating.kind}
          initialName={creating.name}
          onClose={() => setCreating(null)}
          onSaved={(id) => {
            const field =
              creating.kind === "genre"
                ? "genreIds"
                : creating.kind === "director"
                  ? "directorIds"
                  : "actorIds";
            onChange({
              ...value,
              [field]: [...new Set([...value[field], id])],
            });
            setCreating(null);
          }}
        />
      )}
    </>
  );
}
