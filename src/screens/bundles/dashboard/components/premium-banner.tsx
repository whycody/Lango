import { FC, useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { SmallButton } from '../../../../components';
import { spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { PREMIUM_BANNER_IMAGE_OVERFLOW } from '../constants';

interface PremiumBannerProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const PremiumBanner: FC<PremiumBannerProps> = ({ onPress, style }) => {
    const { colors } = useTheme() as CustomTheme;
    const [cardHeight, setCardHeight] = useState(0);
    const styles = useMemo(() => getStyles(colors), [colors]);

    const handleRootLayout = (event: LayoutChangeEvent) => {
        setCardHeight(event.nativeEvent.layout.height);
    };

    return (
        <View style={[styles.root, style]} onLayout={handleRootLayout}>
            {cardHeight > 0 && (
                <Image
                    source={require('../../../../../assets/photos/student.png')}
                    style={[
                        styles.image,
                        {
                            height: cardHeight + PREMIUM_BANNER_IMAGE_OVERFLOW,
                            width: cardHeight + PREMIUM_BANNER_IMAGE_OVERFLOW,
                        },
                    ]}
                />
            )}
            <View style={styles.content}>
                <CustomText style={styles.title} tx="bundles.premium_banner_title" weight="Bold" />
                <CustomText style={styles.subtitle} tx="bundles.premium_banner_subtitle" />
                <SmallButton
                    icon="arrow-forward"
                    labelColor={colors.card}
                    labelTx="bundles.premium_banner_cta"
                    style={styles.cta}
                    onPress={onPress}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        content: {
            flex: 1,
            marginLeft: 150,
            paddingRight: spacing.xl,
        },
        cta: {
            marginBottom: spacing.xs,
        },
        image: {
            bottom: 0,
            left: -spacing.xl,
            position: 'absolute',
            resizeMode: 'contain',
        },
        root: {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            borderRadius: spacing.l,
            borderWidth: 0,
            justifyContent: 'center',
            paddingVertical: spacing.l,
        },
        subtitle: {
            color: colors.white300,
            fontSize: fontSize.m,
            marginBottom: spacing.l,
        },
        title: {
            color: colors.white,
            fontSize: fontSize.xl,
            marginBottom: spacing.xxs,
        },
    });
