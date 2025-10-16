export type SettingKey = 'aliases.externalReceiptNumber' | 'aliases.workOrderCloseDate' | 'aliases.workOrderOpenDate' | 'application.csrfSecret' | 'burialSiteTypes.bodyCapacityMaxDefault' | 'burialSiteTypes.crematedCapacityMaxDefault' | 'defaults.city' | 'defaults.province' | 'pdfPuppeteer.browserInstallAttempted' | 'workOrder.workDay.0.endHour' | 'workOrder.workDay.0.startHour' | 'workOrder.workDay.1.endHour' | 'workOrder.workDay.1.startHour' | 'workOrder.workDay.2.endHour' | 'workOrder.workDay.2.startHour' | 'workOrder.workDay.3.endHour' | 'workOrder.workDay.3.startHour' | 'workOrder.workDay.4.endHour' | 'workOrder.workDay.4.startHour' | 'workOrder.workDay.5.endHour' | 'workOrder.workDay.5.startHour' | 'workOrder.workDay.6.endHour' | 'workOrder.workDay.6.startHour' | 'workOrder.workOrderMilestone.recentAfterDays' | 'workOrder.workOrderMilestone.recentBeforeDays';
export interface SettingProperties {
    settingKey: SettingKey;
    settingName: string;
    description: string;
    type: 'boolean' | 'number' | 'string';
    defaultValue: string;
    isUserConfigurable: boolean;
}
export declare const settingProperties: SettingProperties[];
