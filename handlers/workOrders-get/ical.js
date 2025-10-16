import { getApplicationUrl } from '../../helpers/application.helpers.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const workOrderTypes = getCachedWorkOrderTypes();
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    const applicationUrl = getApplicationUrl(request);
    response.render('workOrders/ical', {
        headTitle: 'Work Order iCalendar Integration',
        workOrderMilestoneTypes,
        workOrderTypes,
        applicationUrl
    });
}
