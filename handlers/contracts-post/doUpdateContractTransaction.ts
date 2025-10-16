import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getContractTransactions from '../../database/getContractTransactions.js'
import updateContractTransaction, {
  type ContractTransactionUpdateForm
} from '../../database/updateContractTransaction.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doUpdateContractTransaction`
)

export default async function handler(
  request: Request<unknown, unknown, ContractTransactionUpdateForm>,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    updateContractTransaction(
      request.body,
      request.session.user as User,
      database
    )

    const contractTransactions = await getContractTransactions(
      request.body.contractId,
      {
        includeIntegrations: true
      },
      database
    )

    response.json({
      success: true,

      contractTransactions
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
