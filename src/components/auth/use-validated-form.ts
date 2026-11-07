"use client";

import { useState, type FormEvent } from "react";
import type { FieldProblems } from "@/lib/validation";

/**
 * Checks a sign-in form before it is sent and shows the problem under each wrong field (gap G9: the design has no field errors
 * on these screens). Put `noValidate` on the form so the browser's own bubbles do not appear as well. The server checks again.
 * A field that is wrong gets focus, and its message goes away as soon as the person types in it.
 */
export function useValidatedForm<Field extends string>(check: (values: Record<Field, string>) => FieldProblems<Field>, fields: readonly Field[]) {
  const [problems, setProblems] = useState<FieldProblems<Field>>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map((field) => [field, String(data.get(field) ?? "")])) as Record<Field, string>;
    const found = check(values);
    setProblems(found);
    const first = fields.find((field) => found[field]);
    if (!first) return;
    event.preventDefault();
    (event.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
  };

  const clear = (field: Field) =>
    setProblems((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  return { problems, onSubmit, clear };
}
