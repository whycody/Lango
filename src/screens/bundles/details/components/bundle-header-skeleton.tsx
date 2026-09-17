import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '../../../../components/skeleton/skeleton-block';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../../constants/margins';
import {
    BUNDLE_CREATOR_INFO_AVATAR_SIZE,
    BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT,
} from '../../common/constants';
import {
    BUNDLE_HEADER_SKELETON_CREATOR_NAME_WIDTH,
    BUNDLE_HEADER_SKELETON_SUBTITLE_WIDTH,
    BUNDLE_HEADER_SKELETON_TITLE_WIDTH,
    BUNDLE_SUBTITLE_LINE_HEIGHT,
    BUNDLE_TITLE_LINE_HEIGHT,
} from '../constants';

export const BundleHeaderSkeleton = () => (
    <View style={styles.root}>
        <SkeletonBlock
            height={BUNDLE_TITLE_LINE_HEIGHT}
            width={BUNDLE_HEADER_SKELETON_TITLE_WIDTH}
        />
        <SkeletonBlock
            height={BUNDLE_SUBTITLE_LINE_HEIGHT}
            style={styles.subtitlePlaceholder}
            width={BUNDLE_HEADER_SKELETON_SUBTITLE_WIDTH}
        />
        <View style={styles.creatorInfoPlaceholder}>
            <SkeletonBlock
                height={BUNDLE_CREATOR_INFO_AVATAR_SIZE}
                style={styles.creatorInfoAvatarPlaceholder}
                width={BUNDLE_CREATOR_INFO_AVATAR_SIZE}
            />
            <SkeletonBlock
                height={BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT}
                width={BUNDLE_HEADER_SKELETON_CREATOR_NAME_WIDTH}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    creatorInfoAvatarPlaceholder: {
        borderRadius: spacing.m,
    },
    creatorInfoPlaceholder: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.l,
    },
    root: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: MARGIN_VERTICAL,
    },
    subtitlePlaceholder: {
        marginTop: spacing.m,
    },
});
