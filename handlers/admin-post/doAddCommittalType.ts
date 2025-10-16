import type { Request, Response } from 'express'

import addCommittalType from '../../database/addCommittalType.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const committalTypeId = addCommittalType(
    request.body,
    request.session.user as User
  )

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success: true,

    committalTypeId,
    committalTypes
  })
}
