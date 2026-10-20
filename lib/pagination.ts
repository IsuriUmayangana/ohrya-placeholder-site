export type PaginationItem = number | "ellipsis";

export type PaginationVariant = "default" | "narrow";

function buildPaginationItems(pages: Set<number>): PaginationItem[] {
  const sorted = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(sorted[i]);
  }
  return items;
}

/**
 * default: first three pages, current neighborhood, last two (desktop).
 * narrow: first page, current neighborhood, last page (mobile).
 */
export function getPaginationItems(
  page: number,
  totalPages: number,
  variant: PaginationVariant = "default",
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  if (variant === "narrow") {
    pages.add(1);
    pages.add(totalPages);
  } else {
    pages.add(1);
    pages.add(2);
    pages.add(3);
    pages.add(totalPages - 1);
    pages.add(totalPages);
  }

  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  return buildPaginationItems(pages);
}
