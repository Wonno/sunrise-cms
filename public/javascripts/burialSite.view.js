(() => {
    /*
     * Map
     */
    const sunrise = exports.sunrise;
    const mapContainerElement = document.querySelector('#burialSite--leaflet');
    if (mapContainerElement !== null) {
        const mapLatitude = Number.parseFloat(mapContainerElement.dataset.latitude ?? '');
        const mapLongitude = Number.parseFloat(mapContainerElement.dataset.longitude ?? '');
        const mapCoordinates = [mapLatitude, mapLongitude];
        const map = new L.Map(mapContainerElement, {
            scrollWheelZoom: false
        });
        map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
        new L.TileLayer(sunrise.leafletConstants.tileLayerUrl, {
            attribution: sunrise.leafletConstants.attribution,
            maxZoom: sunrise.leafletConstants.maxZoom
        }).addTo(map);
        new L.Marker(mapCoordinates).addTo(map);
    }
    /*
     * Image
     */
    const svgContainerElement = document.querySelector('#burialSite--cemeterySvg');
    if (svgContainerElement !== null) {
        sunrise.highlightMap(svgContainerElement, svgContainerElement.dataset.cemeterySvgId ?? '', 'success');
    }
    /*
     * Contracts
     */
    document
        .querySelector('#burialSite--contractsToggle')
        ?.addEventListener('click', () => {
        const tableRowElements = document.querySelectorAll('#burialSite--contractsTbody tr[data-is-active="false"]');
        for (const tableRowElement of tableRowElements) {
            tableRowElement.classList.toggle('is-hidden');
        }
    });
    /*
     * Restore Deleted
     */
    document
        .querySelector('button.is-restore-burial-site-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const burialSiteId = buttonElement.dataset.burialSiteId ?? '';
        if (burialSiteId === '') {
            return;
        }
        function doRestore() {
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doRestoreBurialSite`, { burialSiteId }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    globalThis.location.reload();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Restoring Burial Site',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Restore Burial Site',
            message: 'Are you sure you want to restore this burial site? It will be visible again.',
            okButton: {
                callbackFunction: doRestore,
                text: 'Yes, Restore Burial Site'
            }
        });
    });
})();
