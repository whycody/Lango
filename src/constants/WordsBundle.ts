import { Ionicons } from '@expo/vector-icons';

import { ApiErrorCode } from '../api/api.types';
import { WordsBundleVisibility } from '../types';
import { palette } from './palette';

export const BUNDLE_TITLE_MAX_LENGTH = 50;
export const BUNDLE_DESCRIPTION_MAX_LENGTH = 200;

export const BUNDLE_REMOVE_ERROR_MESSAGE_KEYS: Record<ApiErrorCode, string> = {
    forbidden: 'bundle_details.removing.error_forbidden',
    network: 'bundle_details.removing.error_network',
    'not-found': 'bundle_details.removing.error_not_found',
    'server-error': 'bundle_details.removing.error_unknown',
    unauthorized: 'bundle_details.removing.error_unauthorized',
    unknown: 'bundle_details.removing.error_unknown',
    'validation-error': 'bundle_details.removing.error_unknown',
};

export const BUNDLE_VISIBILITY_OPTIONS: {
    visibility: WordsBundleVisibility;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    labelKey: string;
    descKey: string;
}[] = [
    {
        color: palette.blue,
        descKey: 'bundle_details.visibility.public_desc',
        icon: 'globe',
        labelKey: 'bundle_details.visibility.public',
        visibility: 'public',
    },
    {
        color: palette.green,
        descKey: 'bundle_details.visibility.friends_desc',
        icon: 'people',
        labelKey: 'bundle_details.visibility.friends',
        visibility: 'friends',
    },
    {
        color: palette.red,
        descKey: 'bundle_details.visibility.private_desc',
        icon: 'lock-closed',
        labelKey: 'bundle_details.visibility.private',
        visibility: 'private',
    },
];
