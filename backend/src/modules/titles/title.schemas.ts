import { z } from 'zod'
import { dateTimeSchema, idSchema, slugSchema } from '../../shared/lib/validation'

export const titleStatus = z.enum(['draft', 'scheduled', 'published', 'archived'])
export const titleKind = z.enum(['movie', 'series'])
export const creditSchema = z.object({
  personId: idSchema,
  role: z.enum(['director', 'actor']),
  creditOrder: z.number().int().min(0).max(65535).nullable().optional(),
  characterName: z.string().trim().max(150).nullable().optional(),
}).strict()

const titleFields = z.object({
  name: z.string().trim().min(1).max(255),
  originalName: z.string().trim().max(255).nullable().optional(),
  releaseYear: z.number().int().min(1888).max(65535).nullable().optional(),
  synopsis: z.string().max(30000).nullable().optional(),
  editorialRating: z.number().min(0).max(10).nullable().optional(),
  status: titleStatus.default('draft'),
  scheduledAt: dateTimeSchema.nullable().optional(),
  publishedAt: dateTimeSchema.nullable().optional(),
  posterAssetId: idSchema.nullable().optional(),
  backdropAssetId: idSchema.nullable().optional(),
  genreIds: z.array(idSchema).max(50).refine((items) => new Set(items).size === items.length, 'Genre IDs must be unique').optional(),
  credits: z.array(creditSchema).max(100).refine((items) => new Set(items.map(({ personId, role }) => `${personId}:${role}`)).size === items.length, 'Credits must be unique').optional(),
}).strict()

export const titleCreateSchema = titleFields.extend({
  kind: titleKind,
  slug: slugSchema.optional(),
})

export const titleUpdateSchema = titleFields.partial().extend({ status: titleStatus.optional() }).strict()

export const seasonCreateSchema = z.object({
  seasonNumber: z.number().int().min(1).max(65535),
  name: z.string().trim().min(1).max(150),
}).strict()
export const seasonUpdateSchema = z.object({ name: z.string().trim().min(1).max(150) }).strict()

const episodeFields = z.object({
  name: z.string().trim().min(1).max(255),
  synopsis: z.string().max(30000).nullable().optional(),
  durationSeconds: z.number().int().min(0).max(4294967295).nullable().optional(),
  status: titleStatus.default('draft'),
  scheduledAt: dateTimeSchema.nullable().optional(),
  publishedAt: dateTimeSchema.nullable().optional(),
  thumbnailAssetId: idSchema.nullable().optional(),
}).strict()

export const episodeCreateSchema = episodeFields.extend({
  episodeNumber: z.number().int().min(1).max(65535),
  slug: slugSchema.optional(),
})
export const episodeUpdateSchema = episodeFields.partial().extend({ status: titleStatus.optional() }).strict()

export const sourceSchema = z.object({
  sourceKind: z.enum(['uploaded', 'external']),
  mediaAssetId: idSchema.nullable().optional(),
  playbackUrl: z.url({ protocol: /^https?$/ }).max(2048).nullable().optional(),
  format: z.enum(['mp4', 'webm', 'hls', 'dash']),
  priority: z.number().int().min(1).max(65535),
  isActive: z.boolean(),
}).strict().refine((input) => input.sourceKind === 'uploaded'
  ? Boolean(input.mediaAssetId) && !input.playbackUrl
  : Boolean(input.playbackUrl) && !input.mediaAssetId, 'Choose exactly one video asset or playback URL')

export const subtitleSchema = z.object({
  languageCode: z.string().trim().min(2).max(10).regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/),
  label: z.string().trim().min(1).max(50),
  format: z.enum(['vtt', 'srt']),
  mediaAssetId: idSchema.nullable().optional(),
  subtitleUrl: z.url({ protocol: /^https?$/ }).max(2048).nullable().optional(),
  isDefault: z.boolean(),
}).strict().refine((input) => Boolean(input.mediaAssetId) !== Boolean(input.subtitleUrl), 'Choose exactly one subtitle asset or URL')
