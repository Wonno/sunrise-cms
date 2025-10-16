import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addBurialSiteComment, {
  type AddBurialSiteCommentForm
} from '../../database/addBurialSiteComment.js'
import getBurialSiteComments from '../../database/getBurialSiteComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:burialSites:doAddBurialSiteComment`
)

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteCommentForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addBurialSiteComment(request.body, request.session.user as User, database)

    const burialSiteComments = getBurialSiteComments(
      request.body.burialSiteId,
      database
    )

    response.json({
      success: true,

      burialSiteComments
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
