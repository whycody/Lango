import { StyleSheet, View } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../../constants/margins';
import {
    BUNDLE_CREATOR_INFO_AVATAR_SIZE,
    BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT,
} from '../../../../ui/components/home';
import { SkeletonBlock } from '../../../../ui/components/SkeletonBlock';
import { BUNDLE_SUBTITLE_LINE_HEIGHT, BUNDLE_TITLE_LINE_HEIGHT } from '../constants';

export const BundleHeaderSkeleton = () => (
    <>
        <SkeletonBlock
            height={BUNDLE_TITLE_LINE_HEIGHT}
            style={styles.titlePlaceholder}
            width="65%"
        />
        <SkeletonBlock
            height={BUNDLE_SUBTITLE_LINE_HEIGHT}
            style={styles.subtitlePlaceholder}
            width="55%"
        />
        <View style={styles.creatorInfoPlaceholder}>
            <SkeletonBlock
                height={BUNDLE_CREATOR_INFO_AVATAR_SIZE}
                style={styles.creatorInfoAvatarPlaceholder}
                width={BUNDLE_CREATOR_INFO_AVATAR_SIZE}
            />
            <SkeletonBlock height={BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT} width="30%" />
        </View>
    </>
);

const styles = StyleSheet.create({
    creatorInfoAvatarPlaceholder: {
        borderRadius: spacing.m,
    },
    creatorInfoPlaceholder: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.m,
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: spacing.l,
    },
    subtitlePlaceholder: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: spacing.m,
    },
    titlePlaceholder: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: MARGIN_VERTICAL,
    },
});
