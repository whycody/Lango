import { ApiErrorCode } from '../../../api/api.types';
import { spacing } from '../../../constants/margins';
import { BundleMemberRole, TranslationKey } from '../../../types';

export const MEMBER_AVATAR_SIZE = 32;
export const MEMBER_AVATAR_FALLBACK_ICON_SIZE = 18;
export const MEMBER_ROW_ACTION_ICON_SIZE = 22;

export const MEMBER_SKELETON_ROW_COUNT = 6;
export const MEMBER_SKELETON_NAME_LINE_HEIGHT = 22;
export const MEMBER_SKELETON_ROLE_LINE_HEIGHT = 14;
export const MEMBER_SKELETON_NAME_WIDTH = 140;
export const MEMBER_SKELETON_ROLE_WIDTH = 80;
export const MEMBER_SKELETON_OPACITY_MIN = 0.3;
export const MEMBER_SKELETON_OPACITY_MAX = 1;
export const MEMBER_SKELETON_FADE_MS = 350;
export const MEMBER_SKELETON_STAGGER_MS = 150;

export const MEMBERS_TITLE_LINE_HEIGHT = 31;
export const MEMBERS_SUBTITLE_LINE_HEIGHT = 20;

export const MEMBERS_SCROLL_TO_TOP_THRESHOLD = 300;
export const MEMBERS_SCROLL_TO_TOP_ANIM_DURATION = 200;
export const MEMBERS_BOTTOM_PANEL_OPACITY_DURATION = 220;
export const MEMBERS_BOTTOM_PANEL_SHOW_OFFSET = -20;
export const MEMBERS_DOCKED_ACTION_PANEL_HEIGHT = 56;
export const MEMBERS_LIST_BOTTOM_SPACING = spacing.xxxl;

export const MEMBER_ACTIONS_BOTTOM_SHEET = 'bundle-members-member-actions-bottom-sheet';
export const TRANSFER_OWNERSHIP_BOTTOM_SHEET = 'bundle-members-transfer-ownership-bottom-sheet';
export const REMOVE_MEMBER_BOTTOM_SHEET = 'bundle-members-remove-member-bottom-sheet';
export const SHARE_BUNDLE_BOTTOM_SHEET = 'bundle-members-share-bundle-bottom-sheet';

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const MEMBER_ROLE_SORT_ORDER: Record<BundleMemberRole, number> = {
    owner: 0,
    editor: 1,
    viewer: 2,
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const MEMBERS_ERROR_MESSAGE_KEYS: Record<ApiErrorCode, TranslationKey> = {
    'already-member': 'bundle_details.members.error_unknown',
    forbidden: 'bundle_details.members.error_forbidden',
    network: 'bundle_details.members.error_network',
    'not-found': 'bundle_details.members.error_not_found',
    'server-error': 'bundle_details.members.error_unknown',
    unauthorized: 'bundle_details.members.error_unauthorized',
    unknown: 'bundle_details.members.error_unknown',
    'validation-error': 'bundle_details.members.error_unknown',
};
