export function slugify(value: string): string {
  return value
    .trim()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function uniqueSlug(value: string, existingSlugs: Iterable<string>): string {
  const base = slugify(value) || 'khong-co-ten'
  const used = new Set(existingSlugs)
  let slug = base
  let suffix = 2
  while (used.has(slug)) slug = `${base}-${suffix++}`
  return slug
}

// Mock catalogue: distinguish episodes with the same number in different parts.
export function catalogEpisodeSlug(partName: string, episodeNumber: number): string {
  return `${slugify(partName)}-tap-${episodeNumber}`
}
