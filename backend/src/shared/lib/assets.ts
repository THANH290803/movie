import type { Knex } from 'knex'
import { HttpError } from '../http/errors'

export async function requireAssetKind(database: Knex | Knex.Transaction, id: string | null | undefined, kind: string) {
  if (!id) return
  const asset = await database('media_assets').where({ id }).first('asset_kind')
  if (!asset || asset.asset_kind !== kind) {
    throw new HttpError(400, 'INVALID_ASSET', `Expected an existing ${kind} media asset`)
  }
}
