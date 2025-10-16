import { formatPhoneNumber } from '@cityssm/consigno-cloud-api/utilities.js';
import { parseFullName } from 'parse-full-name';
import getContract from '../../database/getContract.js';
import getContractMetadataByContractId from '../../database/getContractMetadataByContractId.js';
import { getCachedContractTypePrintsById } from '../../helpers/cache/contractTypes.cache.js';
import { getPrintConfig } from '../../helpers/print.helpers.js';
export default async function handler(request, response) {
    /*
     * Validate Contract
     */
    const contract = await getContract(request.body.contractId);
    if (contract === undefined) {
        response.json({
            success: false,
            errorMessage: 'Contract not found.'
        });
        return;
    }
    else if (contract.purchaserEmail === '' ||
        contract.purchaserPhoneNumber === '') {
        response.json({
            success: false,
            errorMessage: 'Contract must have a valid purchaser email and phone number.'
        });
        return;
    }
    const parsedName = parseFullName(contract.purchaserName);
    let purchaserFirstName = parsedName.first;
    let purchaserLastName = parsedName.last;
    if (purchaserFirstName === undefined || purchaserLastName === undefined) {
        purchaserFirstName = contract.purchaserName;
        purchaserLastName = '';
    }
    const { phone: signerPhone } = formatPhoneNumber(contract.purchaserPhoneNumber);
    /*
     * Validate Available Prints
     */
    const contractPrints = getCachedContractTypePrintsById(contract.contractTypeId);
    const consignoCloudPrints = [];
    for (const printName of contractPrints) {
        const printConfig = getPrintConfig(printName);
        if (printName.startsWith('pdf/') &&
            printConfig?.consignoCloud !== undefined) {
            consignoCloudPrints.push({
                printName,
                printTitle: printConfig.title
            });
        }
    }
    if (consignoCloudPrints.length === 0) {
        response.json({
            errorMessage: 'No prints available for Consigno Cloud.',
            success: false
        });
        return;
    }
    /*
     * Validate Contract Metadata
     */
    const contractMetadata = getContractMetadataByContractId(request.body.contractId, 'consignoCloud.');
    if (Object.keys(contractMetadata).length > 0) {
        response.json({
            errorMessage: 'Contract already has an active Consigno Cloud process.',
            success: false
        });
        return;
    }
    response.json({
        success: true,
        workflowTitle: `Contract #${contract.contractId} - ${contract.contractType} (${contract.purchaserName})`,
        consignoCloudPrints,
        signerFirstName: purchaserFirstName,
        signerLastName: purchaserLastName,
        signerEmail: contract.purchaserEmail,
        signerPhone
    });
}
