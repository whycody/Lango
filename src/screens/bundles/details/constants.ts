import { ApiErrorCode } from '../../../api/api.types';
import { palette } from '../../../constants/palette';
import { TranslationKey } from '../../../types';
import { BundleVisibilityOption } from './types';

export const BUNDLE_REMOVE_ERROR_MESSAGE_KEYS: Record<ApiErrorCode, TranslationKey> = {
    'already-member': 'bundle_details.removing.error_unknown',
    forbidden: 'bundle_details.removing.error_forbidden',
    network: 'bundle_details.removing.error_network',
    'not-found': 'bundle_details.removing.error_not_found',
    'server-error': 'bundle_details.removing.error_unknown',
    unauthorized: 'bundle_details.removing.error_unauthorized',
    unknown: 'bundle_details.removing.error_unknown',
    'validation-error': 'bundle_details.removing.error_unknown',
};

export const BUNDLE_VISIBILITY_OPTIONS: BundleVisibilityOption[] = [
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

export const TITLE_SCROLL_START = 40;
export const TITLE_SCROLL_END = 80;

export const SCROLL_TO_TOP_THRESHOLD = 300;
export const CONTENT_TITLE_SCROLL_START = 40;
export const CONTENT_TITLE_SCROLL_END = 80;
export const BOTTOM_PANEL_SHOW_OFFSET = -20;

export const TOP_BAR_PRESS_SCALE = 0.85;
export const TOP_BAR_BACK_ICON_SIZE = 26;
export const TOP_BAR_MORE_ICON_SIZE = 22;
export const TOP_BAR_TITLE_HORIZONTAL_INSET = 56;
export const TOP_BAR_IOS_HEIGHT = 44;
export const TOP_BAR_ANDROID_HEIGHT = 56;

export const BUNDLE_TITLE_LINE_HEIGHT = 31;
export const BUNDLE_SUBTITLE_LINE_HEIGHT = 16;

export const EDIT_BUNDLE_SHEET_NAME = 'bundle-options-edit-bundle-sheet';
export const VISIBILITY_SHEET_NAME = 'bundle-options-visibility-sheet';
export const REMOVE_BUNDLE_SHEET_NAME = 'bundle-options-remove-bundle-sheet';
export const LEAVE_BUNDLE_SHEET_NAME = 'bundle-options-leave-bundle-sheet';
export const SHARE_BUNDLE_SHEET_NAME = 'bundle-options-share-bundle-sheet';
