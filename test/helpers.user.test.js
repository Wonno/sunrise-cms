import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getCachedApiKeys } from '../helpers/cache/apiKeys.cache.js';
import * as userFunctions from '../helpers/user.helpers.js';
import { testAdmin, testUpdate, testView } from './_globals.js';
await describe('helpers.user', async () => {
    await describe('unauthenticated, no user in session', async () => {
        const noUserRequest = {
            session: {}
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdateContracts(noUserRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(noUserRequest), false);
        });
    });
    await describe('read only user, no update, no admin', async () => {
        const readOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdateCemeteries: false,
                        canUpdateContracts: false,
                        canUpdateWorkOrders: false,
                        isAdmin: false
                    },
                    userSettings: {}
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdateCemeteries(readOnlyRequest), false);
            assert.strictEqual(userFunctions.userCanUpdateContracts(readOnlyRequest), false);
            assert.strictEqual(userFunctions.userCanUpdateWorkOrders(readOnlyRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(readOnlyRequest), false);
        });
    });
    await describe('update only user, no admin', async () => {
        const updateOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdateCemeteries: true,
                        canUpdateContracts: true,
                        canUpdateWorkOrders: true,
                        isAdmin: false
                    },
                    userSettings: {}
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.userCanUpdateCemeteries(updateOnlyRequest), true);
            assert.strictEqual(userFunctions.userCanUpdateContracts(updateOnlyRequest), true);
            assert.strictEqual(userFunctions.userCanUpdateWorkOrders(updateOnlyRequest), true);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(updateOnlyRequest), false);
        });
    });
    await describe('admin only user, no update', async () => {
        const adminOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdateCemeteries: false,
                        canUpdateContracts: false,
                        canUpdateWorkOrders: false,
                        isAdmin: true
                    },
                    userSettings: {}
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdateCemeteries(adminOnlyRequest), false);
            assert.strictEqual(userFunctions.userCanUpdateContracts(adminOnlyRequest), false);
            assert.strictEqual(userFunctions.userCanUpdateWorkOrders(adminOnlyRequest), false);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(adminOnlyRequest), true);
        });
    });
    await describe('update admin user', async () => {
        const updateAdminRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdateCemeteries: true,
                        canUpdateContracts: true,
                        canUpdateWorkOrders: true,
                        isAdmin: true
                    },
                    userSettings: {}
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.userCanUpdateCemeteries(updateAdminRequest), true);
            assert.strictEqual(userFunctions.userCanUpdateContracts(updateAdminRequest), true);
            assert.strictEqual(userFunctions.userCanUpdateWorkOrders(updateAdminRequest), true);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(updateAdminRequest), true);
        });
    });
    await describe('API key check', async () => {
        await it('authenticates with a valid API key', () => {
            let apiKeys = getCachedApiKeys();
            if (Object.keys(apiKeys).length === 0) {
                userFunctions.getUser(testAdmin);
                userFunctions.getUser(testUpdate);
                userFunctions.getUser(testView);
                apiKeys = getCachedApiKeys();
            }
            assert.ok(Object.keys(apiKeys).length > 0, 'Expected API keys to be present');
            for (const apiKey of Object.values(apiKeys)) {
                const apiRequest = {
                    params: {
                        apiKey
                    }
                };
                assert.strictEqual(userFunctions.apiKeyIsValid(apiRequest), true, `Expected API key '${apiKey}' to be valid`);
            }
        });
        await it('fails to authenticate with an invalid API key', () => {
            const apiRequest = {
                params: {
                    apiKey: 'badKey'
                }
            };
            assert.strictEqual(userFunctions.apiKeyIsValid(apiRequest), false);
        });
        await it('fails to authenticate with no API key', () => {
            const apiRequest = {
                params: {}
            };
            assert.strictEqual(userFunctions.apiKeyIsValid(apiRequest), false);
        });
    });
});
