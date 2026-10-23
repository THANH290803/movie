import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export function assertFound<T>(value: T): NonNullable<T> {
  if (value == null) throw new HttpError(404, 'NOT_FOUND', 'Resource not found')
  return value as NonNullable<T>
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: 'VALIDATION_ERROR', details: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })) })
    return
  }
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.code, message: error.message })
    return
  }
  const databaseError = error as { code?: string }
  if (databaseError?.code === 'ER_DUP_ENTRY') {
    response.status(409).json({ error: 'CONFLICT', message: 'A unique value already exists' })
    return
  }
  if (databaseError?.code === 'ER_ROW_IS_REFERENCED_2') {
    response.status(409).json({ error: 'RESOURCE_IN_USE', message: 'Resource is still referenced' })
    return
  }
  if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2') {
    response.status(400).json({ error: 'INVALID_REFERENCE', message: 'Referenced resource does not exist' })
    return
  }
  if (databaseError?.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || databaseError?.code === 'ER_DATA_TOO_LONG') {
    response.status(400).json({ error: 'INVALID_DATA', message: 'Data does not satisfy database constraints' })
    return
  }
  if (databaseError?.code === 'ER_NO_SUCH_TABLE' || databaseError?.code === 'ECONNREFUSED' || databaseError?.code === 'PROTOCOL_CONNECTION_LOST') {
    response.status(503).json({ error: 'DATABASE_UNAVAILABLE', message: 'Database or schema is unavailable' })
    return
  }
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'INVALID_JSON', message: 'Invalid JSON body' })
    return
  }
  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
    response.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'JSON body exceeds 1 MB' })
    return
  }
  console.error(error)
  response.status(500).json({ error: 'INTERNAL_ERROR', message: 'Unexpected server error' })
}
