import DeviceInfo from 'react-native-device-info';

import { getTimezone } from './dateUtil';

const getDeviceId = async () => {
    try {
        return await DeviceInfo.getUniqueId();
    } catch (e) {
        console.error('Error getting device ID:', e);
        return '';
    }
};

export const createAuthData = async (data: Record<string, unknown> = {}) => ({
    ...data,
    deviceId: await getDeviceId(),
    timezone: getTimezone(),
});
