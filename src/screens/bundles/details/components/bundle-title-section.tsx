import { FC, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { BundleCreatorInfo } from '../../common/components';
import { BUNDLE_SUBTITLE_LINE_HEIGHT, BUNDLE_TITLE_LINE_HEIGHT } from '../constants';
import { BundleHeaderSkeleton } from './bundle-header-skeleton';

type BundleTitleData = {
    description?: string | null;
    ownerId: string;
    title: string;
};

interface BundleTitleSectionProps {
    bundle?: BundleTitleData;
    colors: ThemeColors;
    contentTitleOpacity: Animated.AnimatedInterpolation<number>;
    flashcardsCount: number;
    previewOwnerName?: string;
    previewOwnerPicture?: string;
}

export const BundleTitleSection: FC<BundleTitleSectionProps> = ({
    bundle,
    colors,
    contentTitleOpacity,
    flashcardsCount,
    previewOwnerName,
    previewOwnerPicture,
}) => {
    const styles = useMemo(() => getStyles(colors), [colors]);

    if (!bundle) return <BundleHeaderSkeleton />;

    return (
        <>
            <Animated.View style={{ opacity: contentTitleOpacity }}>
                <CustomText style={styles.title} text={bundle.title} weight="Bold" />
            </Animated.View>
            {bundle.description && <CustomText style={styles.subtitle} text={bundle.description} />}
            <BundleCreatorInfo
                creatorId={bundle.ownerId ?? ''}
                flashcardsCount={flashcardsCount}
                name={previewOwnerName}
                picture={previewOwnerPicture}
                style={styles.creatorInfo}
            />
        </>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        creatorInfo: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.l,
        },
        subtitle: {
            color: colors.white300,
            fontSize: fontSize.xl,
            lineHeight: BUNDLE_SUBTITLE_LINE_HEIGHT,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.m,
        },
        title: {
            color: colors.white,
            fontSize: fontSize.display,
            lineHeight: BUNDLE_TITLE_LINE_HEIGHT,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
