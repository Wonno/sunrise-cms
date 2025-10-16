import type { Request, Response } from 'express'

import closeWorkOrder, {
  type CloseWorkOrderForm
} from '../../database/closeWorkOrder.js'

export default function handler(
  request: Request<unknown, unknown, CloseWorkOrderForm>,
  response: Response
): void {
  const success = closeWorkOrder(request.body, request.session.user as User)

  const workOrderIdNumber =
    typeof request.body.workOrderId === 'string'
      ? Number.parseInt(request.body.workOrderId)
      : request.body.workOrderId

  response.json({
    success,

    workOrderId: success ? workOrderIdNumber : undefined
  })
}
