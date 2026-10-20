import { FC, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_VERTICAL, spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors, TranslationKey } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { MEMBERS_SUBTITLE_LINE_HEIGHT, MEMBERS_TITLE_LINE_HEIGHT } from '../constants';

interface BundleMembersTitleSectionProps {
    description?: string;
    descriptionTx?: TranslationKey;
    title?: string;
    titleTx?: TranslationKey;
}

export const BundleMembersTitleSection: FC<BundleMembersTitleSectionProps> = ({
    description,
    descriptionTx,
    title,
    titleTx,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <>
            <CustomText style={styles.title} text={title} tx={titleTx} weight="Bold" />
            {(description || descriptionTx) && (
                <CustomText style={styles.description} text={description} tx={descriptionTx} />
            )}
        </>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        description: {
            color: colors.white300,
            fontSize: fontSize.l,
            lineHeight: MEMBERS_SUBTITLE_LINE_HEIGHT,
            marginTop: spacing.m,
        },
        title: {
            color: colors.white,
            fontSize: fontSize.display,
            lineHeight: MEMBERS_TITLE_LINE_HEIGHT,
            marginTop: MARGIN_VERTICAL,
        },
    });
