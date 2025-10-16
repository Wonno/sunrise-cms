// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const sunrise = exports.sunrise;
    const feeCategoriesContainerElement = document.querySelector('#container--feeCategories');
    const feeCategoryContainerClassName = 'container--feeCategory';
    const feeCategoryContainerSelector = `.${feeCategoryContainerClassName}`;
    let feeCategories = exports.feeCategories;
    function getFeeCategory(feeCategoryId) {
        return feeCategories.find((currentFeeCategory) => currentFeeCategory.feeCategoryId === feeCategoryId);
    }
    function getFee(feeCategory, feeId) {
        return feeCategory.fees.find((currentFee) => currentFee.feeId === feeId);
    }
    function renderFee(feeCategoryContainerElement, fee) {
        const panelBlockElement = document.createElement('div');
        panelBlockElement.className = 'panel-block is-block container--fee';
        panelBlockElement.dataset.feeId = fee.feeId.toString();
        let tagsHTML = '';
        if (fee.isRequired ?? false) {
            tagsHTML += '<span class="tag is-warning">Required</span>';
        }
        if ((fee.contractTypeId ?? -1) !== -1) {
            tagsHTML += /*html*/ `
        <span class="tag" title="Contract Type Filter">
          <span class="icon is-small"><i class="fa-solid fa-filter"></i></span>
          <span>${cityssm.escapeHTML(fee.contractType ?? '')}</span>
        </span>
      `;
        }
        if ((fee.burialSiteTypeId ?? -1) !== -1) {
            tagsHTML += /*html*/ `
        <span class="tag" title="Burial Site Type Filter">
          <span class="icon is-small"><i class="fa-solid fa-filter"></i></span>
          <span>${cityssm.escapeHTML(fee.burialSiteType ?? '')}</span>
        </span>
      `;
        }
        // eslint-disable-next-line no-unsanitized/property
        panelBlockElement.innerHTML = /*html*/ `
      <div class="columns">
        <div class="column is-half">
          <p>
            <a class="has-text-weight-bold a--editFee" href="#">
              ${cityssm.escapeHTML(fee.feeName ?? '')}
            </a><br />
            <small>
              ${cityssm
            .escapeHTML(fee.feeDescription ?? '')
            .replaceAll('\n', '<br />')}
            </small>
          </p>
          <p class="tags">${tagsHTML}</p>
        </div>
        <div class="column">
          <div class="columns is-mobile">
            <div class="column has-text-centered">
              ${fee.feeFunction
            ? /*html*/ `
                    ${cityssm.escapeHTML(fee.feeFunction)}<br />
                    <small>Fee Function</small>
                  `
            : /*html*/ `
                    <a class="a--editFeeAmount" href="#">
                      $${(fee.feeAmount ?? 0).toFixed(2)}<br />
                      <small>Fee</small>
                    </a>
                  `}
            </div>
            <div class="column has-text-centered">
              ${fee.taxPercentage
            ? `${fee.taxPercentage.toString()}%`
            : `$${(fee.taxAmount ?? 0).toFixed(2)}`}<br />
              <small>Tax</small>
            </div>
            <div class="column has-text-centered">
              ${fee.includeQuantity
            ? `${cityssm.escapeHTML(fee.quantityUnit ?? '')}<br />
                <small>Quantity</small>`
            : ''}
            </div>
          </div>
        </div>
        <div class="column is-narrow is-hidden-print">
          ${sunrise.getMoveUpDownButtonFieldHTML('button--moveFeeUp', 'button--moveFeeDown')}
        </div>
      </div>
    `;
        panelBlockElement
            .querySelector('.a--editFee')
            ?.addEventListener('click', openEditFee);
        panelBlockElement
            .querySelector('.a--editFeeAmount')
            ?.addEventListener('click', openEditFeeAmount);
        panelBlockElement.querySelector('.button--moveFeeUp').addEventListener('click', moveFee);
        panelBlockElement.querySelector('.button--moveFeeDown').addEventListener('click', moveFee);
        feeCategoryContainerElement.append(panelBlockElement);
    }
    function renderFees(feeCategoryContainerElement, feeCategory) {
        if (feeCategory.fees.length === 0) {
            feeCategoryContainerElement.insertAdjacentHTML('beforeend', 
            /*html*/ `
          <div class="panel-block is-block">
            <div class="message is-info">
              <p class="message-body">
                There are no fees in the
                "${cityssm.escapeHTML(feeCategory.feeCategory)}"
                category.
              </p>
            </div>
          </div>
        `);
            feeCategoryContainerElement
                .querySelector('.button--deleteFeeCategory')
                ?.addEventListener('click', confirmDeleteFeeCategory);
        }
        for (const fee of feeCategory.fees) {
            renderFee(feeCategoryContainerElement, fee);
        }
    }
    function renderFeeCategories() {
        if (feeCategories.length === 0) {
            feeCategoriesContainerElement.innerHTML = /*html*/ `
        <div class="message is-warning">
          <p class="message-body">There are no available fees.</p>
        </div>
      `;
            return;
        }
        feeCategoriesContainerElement.innerHTML = '';
        for (const feeCategory of feeCategories) {
            const feeCategoryContainerElement = document.createElement('section');
            feeCategoryContainerElement.className = `panel ${feeCategoryContainerClassName}`;
            feeCategoryContainerElement.dataset.feeCategoryId =
                feeCategory.feeCategoryId.toString();
            // eslint-disable-next-line no-unsanitized/property
            feeCategoryContainerElement.innerHTML = /*html*/ `
        <div class="panel-heading">
          <div class="columns is-vcentered">
            <div class="column">
              <h2 class="title is-5 has-text-white">
                ${cityssm.escapeHTML(feeCategory.feeCategory)}
              </h2>
              ${feeCategory.isGroupedFee
                ? '<span class="tag">Grouped Fee</span>'
                : ''}
            </div>
            <div class="column is-narrow is-hidden-print">
              <div class="field is-grouped is-justify-content-end">
                ${feeCategory.fees.length === 0
                ? /*html*/ `
                      <div class="control">
                        <button class="button is-small is-danger button--deleteFeeCategory" type="button">
                          <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
                          <span>Delete Category</span>
                        </button>
                      </div>
                    `
                : ''}
                <div class="control">
                  <button class="button is-small is-primary button--editFeeCategory" type="button">
                    <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
                    <span>
                      ${feeCategory.isGroupedFee
                ? 'Edit Grouped Fee'
                : 'Edit Category'}
                    </span>
                  </button>
                </div>
                <div class="control">
                  <button class="button is-small is-success button--addFee" data-cy="addFee" type="button">
                    <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                    <span>Add Fee</span>
                  </button>
                </div>
                <div class="control">
                  ${sunrise.getMoveUpDownButtonFieldHTML('button--moveFeeCategoryUp', 'button--moveFeeCategoryDown')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
            renderFees(feeCategoryContainerElement, feeCategory);
            feeCategoryContainerElement
                .querySelector('.button--editFeeCategory')
                ?.addEventListener('click', openEditFeeCategory);
            feeCategoryContainerElement
                .querySelector('.button--addFee')
                ?.addEventListener('click', openAddFee);
            feeCategoryContainerElement.querySelector('.button--moveFeeCategoryUp').addEventListener('click', moveFeeCategory);
            feeCategoryContainerElement.querySelector('.button--moveFeeCategoryDown').addEventListener('click', moveFeeCategory);
            feeCategoriesContainerElement.append(feeCategoryContainerElement);
        }
    }
    /*
     * Fee Categories
     */
    document
        .querySelector('#button--addFeeCategory')
        ?.addEventListener('click', () => {
        let addCloseModalFunction;
        function doAddFeeCategory(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddFeeCategory`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    addCloseModalFunction();
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Creating Fee Category',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminFees-addFeeCategory', {
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#feeCategoryAdd--feeCategory').focus();
                addCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddFeeCategory);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#button--addFeeCategory').focus();
            }
        });
    });
    function openEditFeeCategory(clickEvent) {
        const feeCategoryId = Number.parseInt(clickEvent.currentTarget.closest(feeCategoryContainerSelector).dataset.feeCategoryId ?? '', 10);
        const feeCategory = getFeeCategory(feeCategoryId);
        let editCloseModalFunction;
        function doUpdateFeeCategory(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateFeeCategory`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    editCloseModalFunction();
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Fee Category',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminFees-editFeeCategory', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#feeCategoryEdit--feeCategoryId').value = feeCategory.feeCategoryId.toString();
                modalElement.querySelector('#feeCategoryEdit--feeCategory').value = feeCategory.feeCategory;
                if (feeCategory.isGroupedFee) {
                    ;
                    modalElement.querySelector('#feeCategoryEdit--isGroupedFee').checked = true;
                }
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                editCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateFeeCategory);
                modalElement.querySelector('#feeCategoryEdit--feeCategory').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function confirmDeleteFeeCategory(clickEvent) {
        const feeCategoryId = Number.parseInt(clickEvent.currentTarget.closest(feeCategoryContainerSelector).dataset.feeCategoryId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteFeeCategory`, {
                feeCategoryId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Fee Category',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Fee Category?',
            message: 'Are you sure you want to delete this fee category?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete the Fee Category'
            }
        });
    }
    function moveFeeCategory(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const feeCategoryId = buttonElement.closest(feeCategoryContainerSelector)
            .dataset.feeCategoryId ?? '';
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveFeeCategoryUp'
            : 'doMoveFeeCategoryDown'}`, {
            feeCategoryId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                feeCategories = responseJSON.feeCategories;
                renderFeeCategories();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Moving Fee Category',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    /*
     * Fees
     */
    function openAddFee(clickEvent) {
        const feeCategoryId = Number.parseInt(clickEvent.currentTarget.closest(feeCategoryContainerSelector).dataset.feeCategoryId ?? '', 10);
        let addCloseModalFunction;
        function doAddFee(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddFee`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    addCloseModalFunction();
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Fee',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminFees-addFee', {
            onshow(modalElement) {
                const feeCategoryElement = modalElement.querySelector('#feeAdd--feeCategoryId');
                for (const feeCategory of feeCategories) {
                    const optionElement = document.createElement('option');
                    optionElement.value = feeCategory.feeCategoryId.toString();
                    optionElement.textContent = feeCategory.feeCategory;
                    if (feeCategory.feeCategoryId === feeCategoryId) {
                        optionElement.selected = true;
                    }
                    feeCategoryElement.append(optionElement);
                }
                const contractTypeElement = modalElement.querySelector('#feeAdd--contractTypeId');
                for (const contractType of exports.contractTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = contractType.contractTypeId.toString();
                    optionElement.textContent = contractType.contractType;
                    contractTypeElement.append(optionElement);
                }
                const burialSiteTypeElement = modalElement.querySelector('#feeAdd--burialSiteTypeId');
                for (const burialSiteType of exports.burialSiteTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = burialSiteType.burialSiteTypeId.toString();
                    optionElement.textContent = burialSiteType.burialSiteType;
                    burialSiteTypeElement.append(optionElement);
                }
                ;
                modalElement.querySelector('#feeAdd--taxPercentage').value = exports.taxPercentageDefault.toString();
                sunrise.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('form')?.addEventListener('submit', doAddFee);
                modalElement.querySelector('#feeAdd--feeName').focus();
                modalElement.querySelector('#feeAdd--feeFunction').addEventListener('change', () => {
                    const feeAmountElement = modalElement.querySelector('#feeAdd--feeAmount');
                    const feeFunctionElement = modalElement.querySelector('#feeAdd--feeFunction');
                    if (feeFunctionElement.value === '') {
                        feeFunctionElement
                            .closest('.select')
                            ?.classList.remove('is-success');
                        feeAmountElement.classList.add('is-success');
                        feeAmountElement.disabled = false;
                    }
                    else {
                        feeFunctionElement.closest('.select')?.classList.add('is-success');
                        feeAmountElement.classList.remove('is-success');
                        feeAmountElement.disabled = true;
                    }
                });
                modalElement
                    .querySelector('#feeAdd--taxPercentage')
                    ?.addEventListener('keyup', () => {
                    const taxAmountElement = modalElement.querySelector('#feeAdd--taxAmount');
                    const taxPercentageElement = modalElement.querySelector('#feeAdd--taxPercentage');
                    if (taxPercentageElement.value === '') {
                        taxPercentageElement.classList.remove('is-success');
                        taxAmountElement.classList.add('is-success');
                        taxAmountElement.disabled = false;
                    }
                    else {
                        taxPercentageElement.classList.add('is-success');
                        taxAmountElement.classList.remove('is-success');
                        taxAmountElement.disabled = true;
                    }
                });
                modalElement
                    .querySelector('#feeAdd--includeQuantity')
                    ?.addEventListener('change', () => {
                    ;
                    modalElement.querySelector('#feeAdd--quantityUnit').disabled =
                        modalElement.querySelector('#feeAdd--includeQuantity').value === '';
                });
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditFeeAmount(clickEvent) {
        clickEvent.preventDefault();
        const feeContainerElement = clickEvent.currentTarget.closest('.container--fee');
        const feeId = Number.parseInt(feeContainerElement.dataset.feeId ?? '', 10);
        const feeCategoryId = Number.parseInt(feeContainerElement.closest(feeCategoryContainerSelector)
            .dataset.feeCategoryId ?? '', 10);
        const feeCategory = getFeeCategory(feeCategoryId);
        const fee = getFee(feeCategory, feeId);
        let editCloseModalFunction;
        function doUpdateFeeAmount(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateFeeAmount`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    editCloseModalFunction();
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Fee Amount',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminFees-editFeeAmount', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#feeAmountEdit--feeId').value = fee.feeId.toString();
                modalElement.querySelector('#feeAmountEdit--feeCategory').textContent = feeCategory.feeCategory;
                modalElement.querySelector('#feeAmountEdit--feeName').textContent = fee.feeName ?? '';
                modalElement.querySelector('#feeAmountEdit--feeAmount').value = fee.feeAmount?.toFixed(2) ?? '0';
            },
            onshown(modalElement, closeModalFunction) {
                ;
                modalElement.querySelector('#feeAmountEdit--feeAmount').select();
                editCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateFeeAmount);
            }
        });
    }
    function openEditFee(clickEvent) {
        clickEvent.preventDefault();
        const feeContainerElement = clickEvent.currentTarget.closest('.container--fee');
        const feeId = Number.parseInt(feeContainerElement.dataset.feeId ?? '', 10);
        const feeCategoryId = Number.parseInt(feeContainerElement.closest(feeCategoryContainerSelector)
            .dataset.feeCategoryId ?? '', 10);
        const feeCategory = getFeeCategory(feeCategoryId);
        const fee = getFee(feeCategory, feeId);
        let editCloseModalFunction;
        let editModalElement;
        function doUpdateFee(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateFee`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    feeCategories = responseJSON.feeCategories;
                    editCloseModalFunction();
                    renderFeeCategories();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Fee',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        function confirmDeleteFee(confirmDeleteFeeClickEvent) {
            confirmDeleteFeeClickEvent.preventDefault();
            function doDelete() {
                cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteFee`, {
                    feeId
                }, 
                // eslint-disable-next-line sonarjs/no-nested-functions
                (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        feeCategories = responseJSON.feeCategories;
                        editCloseModalFunction();
                        renderFeeCategories();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Deleting Fee',
                            message: responseJSON.errorMessage ?? ''
                        });
                    }
                });
            }
            bulmaJS.confirm({
                contextualColorName: 'warning',
                title: 'Delete Fee?',
                message: 'Are you sure you want to delete this fee?',
                okButton: {
                    callbackFunction: doDelete,
                    text: 'Yes, Delete the Fee'
                }
            });
        }
        function toggleFeeFields() {
            const feeAmountElement = editModalElement.querySelector('#feeEdit--feeAmount');
            const feeFunctionElement = editModalElement.querySelector('#feeEdit--feeFunction');
            if (feeFunctionElement.value === '') {
                feeFunctionElement.closest('.select')?.classList.remove('is-success');
                feeAmountElement.classList.add('is-success');
                feeAmountElement.disabled = false;
            }
            else {
                feeFunctionElement.closest('.select')?.classList.add('is-success');
                feeAmountElement.classList.remove('is-success');
                feeAmountElement.disabled = true;
            }
        }
        function toggleTaxFields() {
            const taxAmountElement = editModalElement.querySelector('#feeEdit--taxAmount');
            const taxPercentageElement = editModalElement.querySelector('#feeEdit--taxPercentage');
            if (taxPercentageElement.value === '') {
                taxPercentageElement.classList.remove('is-success');
                taxAmountElement.classList.add('is-success');
                taxAmountElement.disabled = false;
            }
            else {
                taxPercentageElement.classList.add('is-success');
                taxAmountElement.classList.remove('is-success');
                taxAmountElement.disabled = true;
            }
        }
        function toggleQuantityFields() {
            const includeQuantityValue = editModalElement.querySelector('#feeEdit--includeQuantity').value;
            editModalElement.querySelector('#feeEdit--quantityUnit').disabled = includeQuantityValue === '';
        }
        cityssm.openHtmlModal('adminFees-editFee', {
            onshow(modalElement) {
                editModalElement = modalElement;
                modalElement.querySelector('#feeEdit--feeId').value = fee.feeId.toString();
                const feeCategoryElement = modalElement.querySelector('#feeEdit--feeCategoryId');
                for (const feeCategoryOption of feeCategories) {
                    const optionElement = document.createElement('option');
                    optionElement.value = feeCategoryOption.feeCategoryId.toString();
                    optionElement.textContent = feeCategoryOption.feeCategory;
                    if (feeCategoryOption.feeCategoryId === feeCategoryId) {
                        optionElement.selected = true;
                    }
                    feeCategoryElement.append(optionElement);
                }
                ;
                modalElement.querySelector('#feeEdit--feeName').value = fee.feeName ?? '';
                modalElement.querySelector('#feeEdit--feeAccount').value = fee.feeAccount ?? '';
                modalElement.querySelector('#feeEdit--feeDescription').value = fee.feeDescription ?? '';
                const contractTypeElement = modalElement.querySelector('#feeEdit--contractTypeId');
                for (const contractType of exports.contractTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = contractType.contractTypeId.toString();
                    optionElement.textContent = contractType.contractType;
                    if (contractType.contractTypeId === fee.contractTypeId) {
                        optionElement.selected = true;
                    }
                    contractTypeElement.append(optionElement);
                }
                const burialSiteTypeElement = modalElement.querySelector('#feeEdit--burialSiteTypeId');
                for (const burialSiteType of exports.burialSiteTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = burialSiteType.burialSiteTypeId.toString();
                    optionElement.textContent = burialSiteType.burialSiteType;
                    if (burialSiteType.burialSiteTypeId === fee.burialSiteTypeId) {
                        optionElement.selected = true;
                    }
                    burialSiteTypeElement.append(optionElement);
                }
                ;
                modalElement.querySelector('#feeEdit--feeAmount').value = fee.feeAmount ? fee.feeAmount.toFixed(2) : '';
                modalElement
                    .querySelector('#feeEdit--feeFunction')
                    ?.addEventListener('change', toggleFeeFields);
                toggleFeeFields();
                modalElement.querySelector('#feeEdit--taxAmount').value = fee.taxAmount ? fee.taxAmount.toFixed(2) : '';
                const taxPercentageElement = modalElement.querySelector('#feeEdit--taxPercentage');
                taxPercentageElement.value = fee.taxPercentage
                    ? fee.taxPercentage.toString()
                    : '';
                taxPercentageElement.addEventListener('keyup', toggleTaxFields);
                toggleTaxFields();
                const includeQuantityElement = modalElement.querySelector('#feeEdit--includeQuantity');
                if (fee.includeQuantity ?? false) {
                    includeQuantityElement.value = '1';
                }
                includeQuantityElement.addEventListener('change', toggleQuantityFields);
                modalElement.querySelector('#feeEdit--quantityUnit').value = fee.quantityUnit ?? '';
                toggleQuantityFields();
                if (fee.isRequired ?? false) {
                    ;
                    modalElement.querySelector('#feeEdit--isRequired').value = '1';
                }
                sunrise.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                editCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateFee);
                bulmaJS.init(modalElement);
                modalElement
                    .querySelector('.button--deleteFee')
                    ?.addEventListener('click', confirmDeleteFee);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function moveFee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const feeContainerElement = buttonElement.closest('.container--fee');
        const feeId = feeContainerElement.dataset.feeId ?? '';
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveFeeUp'
            : 'doMoveFeeDown'}`, {
            feeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                feeCategories = responseJSON.feeCategories;
                renderFeeCategories();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Moving Fee',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    /*
     * Initialize
     */
    renderFeeCategories();
})();
