import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { WorkOrder } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise

  workOrderPrints: string[]
}
;(() => {
  const sunrise = exports.sunrise

  const workOrderPrints = exports.workOrderPrints

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  const limitElement = document.querySelector(
    '#searchFilter--limit'
  ) as HTMLSelectElement

  const offsetElement = document.querySelector(
    '#searchFilter--offset'
  ) as HTMLInputElement

  const hasWorkOrderTypeFilter =
    document.querySelector('#searchFilter--workOrderTypeId') !== null

  function buildRelatedLiHTML(workOrder: WorkOrder): string {
    let relatedHTML = ''

    for (const burialSite of workOrder.workOrderBurialSites ?? []) {
      relatedHTML += /*html*/ `
        <li title="${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}">
          <span class="fa-li">
            <i class="fa-solid fa-map-pin"
              aria-label="Burial Site"></i>
          </span>
          ${cityssm.escapeHTML(
            burialSite.burialSiteName === ''
              ? '(No Burial Site Name)'
              : burialSite.burialSiteName
          )}
        </li>
      `
    }

    for (const contract of workOrder.workOrderContracts ?? []) {
      for (const interment of contract.contractInterments ?? []) {
        relatedHTML += /*html*/ `
          <li
            title="${cityssm.escapeHTML(
              contract.isPreneed ? 'Recipient' : 'Deceased'
            )}">
            <span class="fa-li">
              <i class="fa-solid fa-user"></i>
            </span>
            ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>
        `
      }

      if (contract.funeralHomeName !== null) {
        relatedHTML += /*html*/ `
          <li title="Funeral Home">
            <span class="fa-li">
              <i class="fa-solid fa-place-of-worship"></i>
            </span>
            ${cityssm.escapeHTML(contract.funeralHomeName)}
          </li>
        `
      }
    }

    if (relatedHTML !== '') {
      relatedHTML = /*html*/ `
        <ul class="fa-ul ml-5 is-size-7">
          ${relatedHTML}
        </ul>
      `
    }

    return relatedHTML
  }

  function renderWorkOrders(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      count: number
      offset: number
      workOrders: WorkOrder[]
    }

    if (responseJSON.workOrders.length === 0) {
      searchResultsContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <p class="message-body">There are no work orders that meet the search criteria.</p>
        </div>
      `

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const workOrder of responseJSON.workOrders) {
      const relatedHTML = buildRelatedLiHTML(workOrder)

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        /*html*/ `
          <tr class="avoid-page-break ${(workOrder.workOrderMilestoneOverdueCount ?? 0) > 0 ? 'has-background-warning-light' : ''}">
            <td>
              <div class="columns is-mobile is-vcentered mb-0">
                <div class="column pb-0">
                  <a class="has-text-weight-bold" href="${sunrise.getWorkOrderUrl(workOrder.workOrderId)}">
                    ${
                      workOrder.workOrderNumber?.trim() === ''
                        ? '(No Number)'
                        : cityssm.escapeHTML(workOrder.workOrderNumber ?? '')
                    }
                  </a>
                </div>
                <div class="column is-narrow pb-0">
                  ${
                    workOrder.workOrderMilestoneCount === 0
                      ? ''
                      : /*html*/ `
                        <span class="tag" title="Progress">
                          ${(
                            workOrder.workOrderMilestoneCompletionCount ??
                            ''
                          ).toString()}
                          /
                          ${(workOrder.workOrderMilestoneCount ?? '').toString()}
                        </span>
                      `
                  }
                </div>
              </div>
              ${
                hasWorkOrderTypeFilter
                  ? `${cityssm.escapeHTML(workOrder.workOrderType ?? '')}<br />`
                  : ''
              }
              <span class="is-size-7">
                ${cityssm.escapeHTML(workOrder.workOrderDescription ?? '')}
              </span>
            </td>
            <td>
              ${relatedHTML}
            </td>
            <td>
              <ul class="fa-ul ml-5 is-size-7">
                <li title="${sunrise.escapedAliases.WorkOrderOpenDate}">
                  <span class="fa-li">
                    <i class="fa-solid fa-play" aria-label="${sunrise.escapedAliases.WorkOrderOpenDate}"></i>
                  </span>
                  ${workOrder.workOrderOpenDateString}
                </li>
                <li title="${sunrise.escapedAliases.WorkOrderCloseDate}">
                  <span class="fa-li">
                    <i class="fa-solid fa-stop" aria-label="${sunrise.escapedAliases.WorkOrderCloseDate}"></i>
                  </span>
                  ${
                    workOrder.workOrderCloseDate === null
                      ? /*html*/ `
                        <span class="has-text-grey">
                          (No ${sunrise.escapedAliases.WorkOrderCloseDate})
                        </span>
                      `
                      : workOrder.workOrderCloseDateString
                  }
                </li>
              </ul>
            </td>
            ${
              workOrderPrints.length > 0
                ? /*html*/ `
                  <td>
                    <a
                      class="button is-small"
                      href="${sunrise.urlPrefix}/print/${workOrderPrints[0]}/?workOrderId=${workOrder.workOrderId.toString()}"
                      title="Print"
                      target="_blank"
                    >
                      <span class="icon"><i class="fa-solid fa-print" aria-label="Print"></i></span>
                    </a>
                  </td>
                `
                : ''
            }
          </tr>
        `
      )
    }

    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = /*html*/ `
      <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Related</th>
            <th>Date</th>
            ${workOrderPrints.length > 0 ? '<th class="has-width-1"></th>' : ''}
          </tr>
        </thead>
      </table>
    `

    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      sunrise.getSearchResultsPagerHTML(
        Number.parseInt(limitElement.value, 10),
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetWorkOrders)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetWorkOrders)
  }

  function getWorkOrders(): void {
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Work Orders...'
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doSearchWorkOrders`,
      searchFilterFormElement,
      renderWorkOrders
    )
  }

  function resetOffsetAndGetWorkOrders(): void {
    offsetElement.value = '0'
    getWorkOrders()
  }

  function previousAndGetWorkOrders(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) -
        Number.parseInt(limitElement.value, 10),
      0
    ).toString()
    getWorkOrders()
  }

  function nextAndGetWorkOrders(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) +
      Number.parseInt(limitElement.value, 10)
    ).toString()
    getWorkOrders()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetWorkOrders)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getWorkOrders()
})()
