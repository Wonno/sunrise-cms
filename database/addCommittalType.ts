import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  committalType: string
  committalTypeKey?: string
  orderNumber?: number | string
}

export default function addCommittalType(
  addForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into CommittalTypes (
        committalType, committalTypeKey, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.committalType,
      addForm.committalTypeKey ?? '',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('CommittalTypes')

  return result.lastInsertRowid as number
}
