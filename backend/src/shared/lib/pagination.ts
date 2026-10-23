import type { Knex } from 'knex'

export async function paged<T>(query: Knex.QueryBuilder, page: number, pageSize: number) {
  const totalRow = await query.clone().clearSelect().clearOrder().count<{ total: string | number }>({ total: '*' }).first()
  const total = Number(totalRow?.total ?? 0)
  const data = await query.limit(pageSize).offset((page - 1) * pageSize) as T[]
  return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}
