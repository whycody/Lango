import { StyleSheet, View } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { BUNDLE_CREATOR_INFO_AVATAR_SIZE, BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT } from '../home';
import { SkeletonBlock } from '../SkeletonBlock';

export const BUNDLE_TITLE_LINE_HEIGHT = 31;
export const BUNDLE_SUBTITLE_LINE_HEIGHT = 16;

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
        marginTop: MARGIN_VERTICAL / 2,
    },
    subtitlePlaceholder: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: MARGIN_VERTICAL / 3,
    },
    titlePlaceholder: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: MARGIN_VERTICAL,
    },
});
