(() => {
    const sunrise = exports.sunrise;
    let workOrderTypes = exports.workOrderTypes;
    delete exports.workOrderTypes;
    function updateWorkOrderType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateWorkOrderType`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Work Order Type Updated Successfully'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Work Order Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    function deleteWorkOrderType(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const workOrderTypeId = tableRowElement.dataset.workOrderTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteWorkOrderType`, {
                workOrderTypeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderTypes = responseJSON.workOrderTypes;
                    if (workOrderTypes.length === 0) {
                        renderWorkOrderTypes();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Work Order Type Deleted Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Work Order Type',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Work Order Type',
            message: `Are you sure you want to delete this work order type?<br />
          Note that no work orders will be removed.`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Work Order Type'
            }
        });
    }
    function moveWorkOrderType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const workOrderTypeId = tableRowElement.dataset.workOrderTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveWorkOrderTypeUp'
            : 'doMoveWorkOrderTypeDown'}`, {
            workOrderTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                renderWorkOrderTypes();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Moving Work Order Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    function renderWorkOrderTypes() {
        const containerElement = document.querySelector('#container--workOrderTypes');
        if (workOrderTypes.length === 0) {
            containerElement.innerHTML = /*html*/ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active work order types.</p>
            </div>
          </td>
        </tr>
      `;
            return;
        }
        containerElement.innerHTML = '';
        for (const workOrderType of workOrderTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.workOrderTypeId =
                workOrderType.workOrderTypeId.toString();
            tableRowElement.innerHTML = /*html*/ `
        <td>
          <form>
            <input
              name="workOrderTypeId"
              type="hidden"
              value="${cityssm.escapeHTML(workOrderType.workOrderTypeId.toString())}"
            />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  name="workOrderType"
                  type="text"
                  value="${cityssm.escapeHTML(workOrderType.workOrderType ?? '')}"
                  maxlength="100"
                  aria-label="Work Order Type"
                  required
                />
              </div>
              <div class="control">
                <button
                  class="button is-success"
                  type="submit"
                  aria-label="Save"
                >
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
            </div>
          </form>
        </td>
        <td class="is-nowrap">
          <div class="field is-grouped">
            <div class="control">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveWorkOrderTypeUp', 'button--moveWorkOrderTypeDown', false)}
            </div>
            <div class="control">
              <button class="button is-danger is-light button--deleteWorkOrderType"
                type="button" title="Delete Work Order Type">
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>
      `;
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateWorkOrderType);
            tableRowElement.querySelector('.button--moveWorkOrderTypeUp').addEventListener('click', moveWorkOrderType);
            tableRowElement.querySelector('.button--moveWorkOrderTypeDown').addEventListener('click', moveWorkOrderType);
            tableRowElement
                .querySelector('.button--deleteWorkOrderType')
                ?.addEventListener('click', deleteWorkOrderType);
            containerElement.append(tableRowElement);
        }
    }
    ;
    document.querySelector('#form--addWorkOrderType').addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddWorkOrderType`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                renderWorkOrderTypes();
                formElement.reset();
                formElement.querySelector('input')?.focus();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Work Order Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    });
    renderWorkOrderTypes();
})();
