type Schema = Record<string, unknown>
type Method = 'get' | 'post' | 'patch' | 'put' | 'delete'

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const text = { type: 'string' }
const id = { type: 'string', pattern: '^[1-9][0-9]*$' }
const dateTime = { type: 'string', format: 'date-time' }
const optionalText = { type: ['string', 'null'] }
const optionalId = { type: ['string', 'null'], pattern: '^[1-9][0-9]*$' }
const slug = { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
const titleStatus = { type: 'string', enum: ['draft', 'scheduled', 'published', 'archived'] }
const role = { type: 'string', enum: ['viewer', 'editor', 'admin'] }
const personRole = { type: 'string', enum: ['director', 'actor'] }
const newPassword = {
  type: 'string', format: 'password', minLength: 8,
  description: '8 or more characters, at most 72 UTF-8 bytes; at least one lowercase letter, uppercase letter, digit, and special character.',
}
const obj = (properties: Record<string, unknown>, required: string[] = []): Schema => ({ type: 'object', additionalProperties: false, properties, ...(required.length ? { required } : {}) })

const schemas: Record<string, Schema> = {
  Error: obj({ error: text, message: text, details: { type: 'array', items: obj({ path: text, message: text }) } }, ['error']),
  Pagination: obj({ page: { type: 'integer' }, pageSize: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } }, ['page', 'pageSize', 'total', 'totalPages']),
  User: obj({ id, slug, fullName: text, email: { type: 'string', format: 'email' }, role, planCode: { type: 'string', enum: ['free', 'premium'] }, status: { type: 'string', enum: ['invited', 'active', 'suspended'] }, createdAt: dateTime, updatedAt: dateTime }, ['id', 'slug', 'fullName', 'email', 'role', 'planCode', 'status']),
  AuthTokens: obj({ user: ref('User'), accessToken: text, refreshToken: text }, ['user', 'accessToken', 'refreshToken']),
  RefreshInput: obj({ refreshToken: { type: 'string', format: 'password', description: 'Opaque refresh token returned by register, login, or refresh.' } }, ['refreshToken']),
  RegisterInput: obj({ fullName: text, email: { type: 'string', format: 'email' }, password: newPassword }, ['fullName', 'email', 'password']),
  LoginInput: obj({ email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } }, ['email', 'password']),
  ChangePasswordInput: obj({ currentPassword: { type: 'string', format: 'password' }, newPassword }, ['currentPassword', 'newPassword']),
  UserCreateInput: obj({ fullName: text, email: { type: 'string', format: 'email' }, password: newPassword, role, planCode: { type: 'string', enum: ['free', 'premium'] }, status: { type: 'string', enum: ['invited', 'active', 'suspended'] } }, ['fullName', 'email']),
  UserUpdateInput: obj({ fullName: text, email: { type: 'string', format: 'email' }, password: newPassword, role, planCode: { type: 'string', enum: ['free', 'premium'] }, status: { type: 'string', enum: ['invited', 'active', 'suspended'] } }),
  Genre: obj({ id, name: text, description: optionalText, isActive: { type: 'boolean' }, createdAt: dateTime, updatedAt: dateTime }, ['id', 'name', 'isActive']),
  GenreInput: obj({ name: text, description: optionalText, isActive: { type: 'boolean' } }, ['name']),
  GenreUpdateInput: obj({ name: text, description: optionalText, isActive: { type: 'boolean' } }),
  Person: obj({ id, name: text, country: optionalText, biography: optionalText, roles: { type: 'array', items: personRole, minItems: 1, uniqueItems: true }, isActive: { type: 'boolean' }, createdAt: dateTime, updatedAt: dateTime }, ['id', 'name', 'roles', 'isActive']),
  PersonInput: obj({ name: text, country: optionalText, biography: optionalText, roles: { type: 'array', items: personRole, minItems: 1, uniqueItems: true }, isActive: { type: 'boolean' } }, ['name', 'roles']),
  PersonUpdateInput: obj({ name: text, country: optionalText, biography: optionalText, roles: { type: 'array', items: personRole, minItems: 1, uniqueItems: true }, isActive: { type: 'boolean' } }),
  MediaAsset: obj({ id, assetKind: { type: 'string', enum: ['poster', 'backdrop', 'thumbnail', 'video', 'subtitle'] }, storageKey: text, mimeType: text, sizeBytes: optionalText, processingStatus: { type: 'string', enum: ['uploaded', 'ready', 'failed'] }, url: optionalText, createdByUserId: optionalId, createdAt: dateTime }, ['id', 'assetKind', 'storageKey', 'mimeType', 'processingStatus']),
  MediaAssetInput: obj({ assetKind: { type: 'string', enum: ['poster', 'backdrop', 'thumbnail', 'video', 'subtitle'] }, storageKey: text, mimeType: text, sizeBytes: { type: ['string', 'number', 'null'] }, processingStatus: { type: 'string', enum: ['uploaded', 'ready', 'failed'] } }, ['assetKind', 'storageKey', 'mimeType']),
  MediaAssetUpdateInput: obj({ mimeType: text, sizeBytes: { type: ['string', 'number', 'null'] }, processingStatus: { type: 'string', enum: ['uploaded', 'ready', 'failed'] } }),
  CreditInput: obj({ personId: id, role: personRole, creditOrder: { type: ['integer', 'null'] }, characterName: optionalText }, ['personId', 'role']),
  Credit: obj({ personId: id, name: text, role: personRole, creditOrder: { type: ['integer', 'null'] }, characterName: optionalText }),
  Title: obj({ id, slug, kind: { type: 'string', enum: ['movie', 'series'] }, name: text, originalName: optionalText, releaseYear: { type: ['integer', 'null'] }, synopsis: optionalText, editorialRating: { type: ['number', 'null'], minimum: 0, maximum: 10 }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, posterAssetId: optionalId, backdropAssetId: optionalId, posterUrl: optionalText, backdropUrl: optionalText, createdAt: dateTime, updatedAt: dateTime, deletedAt: { type: ['string', 'null'], format: 'date-time' } }, ['id', 'slug', 'kind', 'name']),
  TitleDetail: { allOf: [ref('Title'), obj({ genres: { type: 'array', items: obj({ id, name: text }) }, credits: { type: 'array', items: ref('Credit') }, seasons: { type: 'array', items: ref('SeasonDetail') } })] },
  TitleCreateInput: obj({ kind: { type: 'string', enum: ['movie', 'series'] }, slug, name: text, originalName: optionalText, releaseYear: { type: ['integer', 'null'] }, synopsis: optionalText, editorialRating: { type: ['number', 'null'], minimum: 0, maximum: 10 }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, posterAssetId: optionalId, backdropAssetId: optionalId, genreIds: { type: 'array', items: id, uniqueItems: true }, credits: { type: 'array', items: ref('CreditInput') } }, ['kind', 'name']),
  TitleUpdateInput: obj({ name: text, originalName: optionalText, releaseYear: { type: ['integer', 'null'] }, synopsis: optionalText, editorialRating: { type: ['number', 'null'], minimum: 0, maximum: 10 }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, posterAssetId: optionalId, backdropAssetId: optionalId, genreIds: { type: 'array', items: id, uniqueItems: true }, credits: { type: 'array', items: ref('CreditInput') } }),
  Season: obj({ id, seasonNumber: { type: 'integer' }, name: text, isImplicit: { type: 'boolean' } }, ['id', 'seasonNumber', 'name', 'isImplicit']),
  SeasonDetail: { allOf: [ref('Season'), obj({ episodes: { type: 'array', items: ref('Episode') } })] },
  SeasonInput: obj({ seasonNumber: { type: 'integer', minimum: 1 }, name: text }, ['seasonNumber', 'name']),
  SeasonUpdateInput: obj({ name: text }, ['name']),
  Episode: obj({ id, seasonId: id, episodeNumber: { type: 'integer' }, slug, name: text, synopsis: optionalText, durationSeconds: { type: ['integer', 'null'] }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, thumbnailAssetId: optionalId, createdAt: dateTime, updatedAt: dateTime }, ['id', 'seasonId', 'episodeNumber', 'slug', 'name']),
  EpisodeInput: obj({ episodeNumber: { type: 'integer', minimum: 1 }, slug, name: text, synopsis: optionalText, durationSeconds: { type: ['integer', 'null'] }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, thumbnailAssetId: optionalId }, ['episodeNumber', 'name']),
  EpisodeUpdateInput: obj({ name: text, synopsis: optionalText, durationSeconds: { type: ['integer', 'null'] }, status: titleStatus, scheduledAt: { type: ['string', 'null'], format: 'date-time' }, publishedAt: { type: ['string', 'null'], format: 'date-time' }, thumbnailAssetId: optionalId }),
  Source: obj({ id, episodeId: id, sourceKind: { type: 'string', enum: ['uploaded', 'external'] }, mediaAssetId: optionalId, playbackUrl: optionalText, format: { type: 'string', enum: ['mp4', 'webm', 'hls', 'dash'] }, priority: { type: 'integer' }, isActive: { type: 'boolean' }, createdAt: dateTime }, ['id', 'episodeId', 'sourceKind', 'format', 'priority', 'isActive']),
  SourceInput: obj({ sourceKind: { type: 'string', enum: ['uploaded', 'external'] }, mediaAssetId: optionalId, playbackUrl: { type: ['string', 'null'], format: 'uri' }, format: { type: 'string', enum: ['mp4', 'webm', 'hls', 'dash'] }, priority: { type: 'integer', minimum: 1 }, isActive: { type: 'boolean' } }, ['sourceKind', 'format', 'priority', 'isActive']),
  Subtitle: obj({ id, episodeId: id, languageCode: text, label: text, format: { type: 'string', enum: ['vtt', 'srt'] }, mediaAssetId: optionalId, subtitleUrl: optionalText, isDefault: { type: 'boolean' }, createdAt: dateTime }, ['id', 'episodeId', 'languageCode', 'label', 'format', 'isDefault']),
  SubtitleInput: obj({ languageCode: text, label: text, format: { type: 'string', enum: ['vtt', 'srt'] }, mediaAssetId: optionalId, subtitleUrl: { type: ['string', 'null'], format: 'uri' }, isDefault: { type: 'boolean' } }, ['languageCode', 'label', 'format', 'isDefault']),
  Playback: obj({ titleSlug: slug, episode: ref('Episode'), source: obj({ id, format: text, sourceKind: text, url: { type: 'string', format: 'uri' } }), subtitles: { type: 'array', items: obj({ languageCode: text, label: text, format: text, isDefault: { type: 'boolean' }, url: { type: 'string', format: 'uri' } }) } }, ['titleSlug', 'episode', 'source', 'subtitles']),
}

const propertiesOf = (name: string) => schemas[name].properties as Record<string, unknown>
schemas.SeasonDetail = obj({ ...propertiesOf('Season'), episodes: { type: 'array', items: ref('Episode') } }, ['id', 'seasonNumber', 'name', 'isImplicit', 'episodes'])
schemas.TitleDetail = obj({ ...propertiesOf('Title'), genres: { type: 'array', items: obj({ id, name: text }) }, credits: { type: 'array', items: ref('Credit') }, seasons: { type: 'array', items: ref('SeasonDetail') } }, ['id', 'slug', 'kind', 'name', 'genres', 'credits', 'seasons'])
schemas.PublicEpisode = obj({ id, seasonId: id, episodeNumber: { type: 'integer' }, slug, name: text, synopsis: optionalText, durationSeconds: { type: ['integer', 'null'] }, publishedAt: { type: ['string', 'null'], format: 'date-time' } }, ['id', 'seasonId', 'episodeNumber', 'slug', 'name'])
const { status: _titleStatus, scheduledAt: _scheduledAt, posterAssetId: _posterId, backdropAssetId: _backdropId, createdAt: _createdAt, updatedAt: _updatedAt, deletedAt: _deletedAt, ...publicTitleProperties } = propertiesOf('Title')
schemas.PublicTitle = obj(publicTitleProperties, ['id', 'slug', 'kind', 'name'])
schemas.PublicSeason = obj({ ...propertiesOf('Season'), episodes: { type: 'array', items: ref('PublicEpisode') } }, ['id', 'seasonNumber', 'name', 'isImplicit', 'episodes'])
schemas.PublicTitleDetail = obj({ ...publicTitleProperties, genres: { type: 'array', items: obj({ id, name: text }) }, credits: { type: 'array', items: ref('Credit') }, seasons: { type: 'array', items: ref('PublicSeason') } }, ['id', 'slug', 'kind', 'name', 'genres', 'credits', 'seasons'])
schemas.Playback = obj({ titleSlug: slug, episode: ref('PublicEpisode'), source: obj({ id, format: text, sourceKind: text, url: { type: 'string', format: 'uri' } }), subtitles: { type: 'array', items: obj({ languageCode: text, label: text, format: text, isDefault: { type: 'boolean' }, url: { type: 'string', format: 'uri' } }) } }, ['titleSlug', 'episode', 'source', 'subtitles'])

const paths: Record<string, Record<string, unknown>> = {}
const parameter = (name: string, description: string) => ({ name, in: 'path', required: true, description, schema: name.toLowerCase().includes('number') ? { type: 'integer' } : name === 'id' ? id : slug })
const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'pageSize', in: 'query', schema: { type: 'integer', enum: [10, 25, 50, 100], default: 10 } },
  { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
]
const response = (schema: Schema) => ({ description: 'Success', content: { 'application/json': { schema } } })
const wrap = (field: string, name: string) => obj({ [field]: ref(name) }, [field])
const list = (name: string) => obj({ data: { type: 'array', items: ref(name) }, pagination: ref('Pagination') }, ['data', 'pagination'])
const data = (name: string) => obj({ data: { type: 'array', items: ref(name) } }, ['data'])

function add(path: string, method: Method, tag: string, summary: string, options: {
  security?: boolean; body?: string | Schema; result?: Schema; status?: number;
  params?: ReturnType<typeof parameter>[]; query?: Schema[]; description?: string;
} = {}) {
  const successStatus = options.status ?? (method === 'post' ? 201 : method === 'delete' ? 204 : 200)
  const requestBody = options.body ? { required: true, content: { 'application/json': { schema: typeof options.body === 'string' ? ref(options.body) : options.body } } } : undefined
  const item = {
    tags: [tag], summary, description: options.description,
    operationId: `${method}_${path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
    ...(options.security === false ? { security: [] } : { security: [{ bearerAuth: [] }] }),
    ...(options.params || options.query ? { parameters: [...(options.params ?? []), ...(options.query ?? [])] } : {}),
    ...(requestBody ? { requestBody } : {}),
    responses: {
      [successStatus]: options.result ? response(options.result) : { description: 'Success' },
      400: { description: 'Invalid input', content: { 'application/json': { schema: ref('Error') } } },
      401: { description: 'Authentication required', content: { 'application/json': { schema: ref('Error') } } },
      403: { description: 'Insufficient permission', content: { 'application/json': { schema: ref('Error') } } },
      404: { description: 'Not found', content: { 'application/json': { schema: ref('Error') } } },
      409: { description: 'Conflict', content: { 'application/json': { schema: ref('Error') } } },
      503: { description: 'Service unavailable', content: { 'application/json': { schema: ref('Error') } } },
    },
  }
  paths[path] ??= {}
  paths[path][method] = item
}

const slugParam = parameter('slug', 'Stable public slug')
const idParam = parameter('id', 'Database identifier')
const titleSlugParam = parameter('titleSlug', 'Title slug')
const episodeSlugParam = parameter('episodeSlug', 'Episode slug')
const seasonNumberParam = parameter('seasonNumber', 'Season number; zero is the implicit movie season')

add('/health', 'get', 'Health', 'Liveness check', { security: false, result: obj({ status: text }) })
add('/health/ready', 'get', 'Health', 'Database and schema readiness', { security: false, result: obj({ status: text }) })
add('/api/v1/auth/register', 'post', 'Auth', 'Register viewer account', { security: false, body: 'RegisterInput', result: ref('AuthTokens') })
add('/api/v1/auth/login', 'post', 'Auth', 'Sign in', { security: false, body: 'LoginInput', status: 200, result: ref('AuthTokens') })
add('/api/v1/auth/refresh', 'post', 'Auth', 'Rotate refresh token', { security: false, body: 'RefreshInput', status: 200, result: ref('AuthTokens'), description: 'Refresh tokens last 30 days. Save the new refreshToken and discard the previous one; the previous token stops working immediately.' })
add('/api/v1/auth/logout', 'post', 'Auth', 'Revoke current session', { security: false, body: 'RefreshInput', status: 204, description: 'Revoke the session identified by this refresh token. Access tokens from the session stop working immediately.' })
add('/api/v1/auth/me', 'get', 'Auth', 'Current account', { result: wrap('user', 'User') })
add('/api/v1/auth/me', 'patch', 'Auth', 'Update own display name', { body: obj({ fullName: text }, ['fullName']), result: wrap('user', 'User') })
add('/api/v1/auth/change-password', 'post', 'Auth', 'Change password', { body: 'ChangePasswordInput', status: 204, description: 'Changing the password revokes every session. Sign in again afterward.' })

add('/api/v1/genres', 'get', 'Catalog metadata', 'List active genres', { security: false, query: paginationParams, result: list('Genre') })
add('/api/v1/people', 'get', 'Catalog metadata', 'List active people', { security: false, query: paginationParams, result: list('Person') })
add('/api/v1/catalog/titles', 'get', 'Catalog', 'List published titles', { security: false, query: [...paginationParams, { name: 'kind', in: 'query', schema: { type: 'string', enum: ['movie', 'series'] } }, { name: 'genre', in: 'query', schema: text }], result: list('PublicTitle') })
add('/api/v1/catalog/titles/{slug}', 'get', 'Catalog', 'Published title detail with seasons and episodes', { security: false, params: [slugParam], result: wrap('title', 'PublicTitleDetail') })
add('/api/v1/catalog/titles/{slug}/playback', 'get', 'Catalog', 'Play first published episode', { security: false, params: [slugParam], result: ref('Playback') })
add('/api/v1/catalog/titles/{slug}/episodes/{episodeSlug}/playback', 'get', 'Catalog', 'Play selected episode', { security: false, params: [slugParam, episodeSlugParam], result: ref('Playback') })
add('/api/v1/catalog/users/{slug}', 'get', 'Catalog', 'Public user profile', { security: false, params: [slugParam], result: obj({ user: obj({ slug, fullName: text }) }) })

add('/api/v1/me/saved-titles', 'get', 'Saved titles', 'List own saved published titles', { query: paginationParams, result: list('PublicTitle') })
add('/api/v1/me/saved-titles', 'post', 'Saved titles', 'Save a published title', { body: obj({ slug }, ['slug']), result: obj({ slug }) })
add('/api/v1/me/saved-titles/{slug}', 'delete', 'Saved titles', 'Remove saved title', { params: [slugParam] })
add('/api/v1/admin/dashboard', 'get', 'Admin', 'Dashboard counts for editor or admin', { result: obj({ users: { type: 'integer' }, movies: { type: 'integer' }, series: { type: 'integer' }, publishedTitles: { type: 'integer' }, episodes: { type: 'integer' }, genres: { type: 'integer' }, people: { type: 'integer' } }) })

function crud(base: string, tag: string, field: string, entity: string, create: string, update: string, identifier = 'id', updateMethod: Method = 'patch', listEntity = entity) {
  const params = [identifier === 'slug' ? slugParam : idParam]
  add(base, 'get', tag, `List ${tag.toLowerCase()}`, { query: paginationParams, result: list(listEntity) })
  add(base, 'post', tag, `Create ${field}`, { body: create, result: wrap(field, entity) })
  add(`${base}/{${identifier}}`, 'get', tag, `Get ${field}`, { params, result: wrap(field, entity) })
  add(`${base}/{${identifier}}`, updateMethod, tag, `Update ${field}`, { params, body: update, result: wrap(field, entity) })
  add(`${base}/{${identifier}}`, 'delete', tag, `Delete ${field}`, { params })
}

crud('/api/v1/admin/users', 'Admin users', 'user', 'User', 'UserCreateInput', 'UserUpdateInput', 'slug')
crud('/api/v1/admin/genres', 'Admin genres', 'genre', 'Genre', 'GenreInput', 'GenreUpdateInput')
crud('/api/v1/admin/people', 'Admin people', 'person', 'Person', 'PersonInput', 'PersonUpdateInput')
crud('/api/v1/admin/media-assets', 'Admin media', 'asset', 'MediaAsset', 'MediaAssetInput', 'MediaAssetUpdateInput')
crud('/api/v1/admin/titles', 'Admin titles', 'title', 'TitleDetail', 'TitleCreateInput', 'TitleUpdateInput', 'slug', 'patch', 'Title')
const adminTitleList = paths['/api/v1/admin/titles'].get as Record<string, unknown>
adminTitleList.parameters = [...paginationParams,
  { name: 'kind', in: 'query', schema: { type: 'string', enum: ['movie', 'series'] } },
  { name: 'status', in: 'query', schema: titleStatus },
  { name: 'includeDeleted', in: 'query', schema: { type: 'string', enum: ['true', 'false'], default: 'false' } },
]
const adminTitleCreate = paths['/api/v1/admin/titles'].post as Record<string, unknown>
adminTitleCreate.description = 'Creates an implicit season automatically; movies also receive their one draft episode. Add an active video source before publishing.'
add('/api/v1/admin/titles/{slug}/restore', 'post', 'Admin titles', 'Restore a soft-deleted title as draft', { params: [slugParam], status: 200, result: wrap('title', 'TitleDetail') })

const seasonBase = '/api/v1/admin/titles/{titleSlug}/seasons'
add(seasonBase, 'get', 'Admin seasons', 'List title seasons', { params: [titleSlugParam], result: data('Season') })
add(seasonBase, 'post', 'Admin seasons', 'Add series season', { params: [titleSlugParam], body: 'SeasonInput', result: wrap('season', 'Season') })
add(`${seasonBase}/{seasonNumber}`, 'get', 'Admin seasons', 'Season detail with episodes', { params: [titleSlugParam, seasonNumberParam], result: wrap('season', 'SeasonDetail') })
add(`${seasonBase}/{seasonNumber}`, 'patch', 'Admin seasons', 'Rename a series season', { params: [titleSlugParam, seasonNumberParam], body: 'SeasonUpdateInput', result: wrap('season', 'Season') })
add(`${seasonBase}/{seasonNumber}`, 'delete', 'Admin seasons', 'Delete an empty series season', { params: [titleSlugParam, seasonNumberParam] })

const episodeBase = `${seasonBase}/{seasonNumber}/episodes`
add(episodeBase, 'get', 'Admin episodes', 'List season episodes', { params: [titleSlugParam, seasonNumberParam], result: data('Episode') })
add(episodeBase, 'post', 'Admin episodes', 'Create series episode', { params: [titleSlugParam, seasonNumberParam], body: 'EpisodeInput', result: wrap('episode', 'Episode') })
add(`${episodeBase}/{episodeSlug}`, 'get', 'Admin episodes', 'Episode detail', { params: [titleSlugParam, seasonNumberParam, episodeSlugParam], result: wrap('episode', 'Episode') })
add(`${episodeBase}/{episodeSlug}`, 'patch', 'Admin episodes', 'Update episode', { params: [titleSlugParam, seasonNumberParam, episodeSlugParam], body: 'EpisodeUpdateInput', result: wrap('episode', 'Episode') })
add(`${episodeBase}/{episodeSlug}`, 'delete', 'Admin episodes', 'Delete a series episode without sources', { params: [titleSlugParam, seasonNumberParam, episodeSlugParam] })

for (const [segment, tag, field, entity, input] of [
  ['sources', 'Admin sources', 'source', 'Source', 'SourceInput'],
  ['subtitles', 'Admin subtitles', 'subtitle', 'Subtitle', 'SubtitleInput'],
] as const) {
  const base = `/api/v1/admin/episodes/{episodeSlug}/${segment}`
  const rule = segment === 'sources'
    ? 'Exactly one of mediaAssetId (uploaded video) or playbackUrl (external HTTP/HTTPS URL) is required. priority must be unique per episode.'
    : 'Exactly one of mediaAssetId (uploaded subtitle) or subtitleUrl (external HTTP/HTTPS URL) is required. At most one subtitle per episode can be the default.'
  add(base, 'get', tag, `List episode ${segment}`, { params: [episodeSlugParam], result: data(entity) })
  add(base, 'post', tag, `Add episode ${field}`, { params: [episodeSlugParam], body: input, result: wrap(field, entity), description: rule })
  add(`${base}/{id}`, 'get', tag, `Get episode ${field}`, { params: [episodeSlugParam, idParam], result: wrap(field, entity) })
  add(`${base}/{id}`, 'put', tag, `Replace episode ${field}`, { params: [episodeSlugParam, idParam], body: input, result: wrap(field, entity), description: rule })
  add(`${base}/{id}`, 'delete', tag, `Delete episode ${field}`, { params: [episodeSlugParam, idParam] })
}

export const openApiDocument = {
  openapi: '3.1.0',
  info: { title: 'Cineflow API', version: '1.0.0', description: 'REST API for Cineflow. IDs are internal decimal strings; public URLs use stable slugs. Uploaded media requires MEDIA_PUBLIC_BASE_URL; video files are stored outside MySQL.' },
  servers: [{ url: '/', description: 'Current API server' }],
  tags: ['Health', 'Auth', 'Catalog metadata', 'Catalog', 'Saved titles', 'Admin', 'Admin users', 'Admin genres', 'Admin people', 'Admin media', 'Admin titles', 'Admin seasons', 'Admin episodes', 'Admin sources', 'Admin subtitles'].map((name) => ({ name })),
  paths,
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas },
}
