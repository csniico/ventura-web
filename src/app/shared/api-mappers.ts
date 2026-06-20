/**
 * The new backend returns MongoDB `_id`; the web models use `id`. These helpers
 * normalize backend records into the client-facing shape (and shallow-map a
 * couple of nested customer fields commonly embedded on orders/invoices) so the
 * existing UI keeps working unchanged.
 */
export function withId<T extends Record<string, any>>(obj: T): T & { id: string } {
  if (!obj) return obj as T & { id: string };
  const anyObj = obj as Record<string, any>;
  return { ...obj, id: anyObj['_id'] ?? anyObj['id'] };
}

export function withIds<T extends Record<string, any>>(arr: T[] | null | undefined): (T & { id: string })[] {
  return (arr ?? []).map((item) => withId(item));
}
