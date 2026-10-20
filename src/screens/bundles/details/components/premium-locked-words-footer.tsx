import { FC, ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { SmallButton } from '../../../../components';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { PREMIUM_LOCKED_ICON_SIZE } from '../constants';

interface PremiumLockedWordsFooterProps {
    // Last visible words, rendered faded out under the gradient.
    children: ReactNode;
    onTryPremiumPress?: () => void;
}

export const PremiumLockedWordsFooter: FC<PremiumLockedWordsFooterProps> = ({
    children,
    onTryPremiumPress,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <View>
            <View pointerEvents="none">
                {children}
                <LinearGradient
                    colors={[`${colors.background}00`, colors.background]}
                    end={{ x: 0, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>
            <View style={styles.content}>
                <Ionicons color={colors.yellow600} name="diamond" size={PREMIUM_LOCKED_ICON_SIZE} />
                <CustomText
                    style={styles.description}
                    tx="bundle_details.premium_locked.desc"
                    weight="SemiBold"
                />
                <SmallButton
                    color={colors.yellow600}
                    icon="arrow-forward"
                    labelColor={colors.background}
                    labelTx="bundle_details.premium_locked.cta"
                    style={styles.cta}
                    onPress={onTryPremiumPress}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        content: {
            alignItems: 'center',
            gap: spacing.l,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
        },
        cta: {
            alignSelf: 'center',
        },
        description: {
            color: colors.white,
            fontSize: fontSize.xl,
            lineHeight: 21,
            textAlign: 'center',
        },
    });
