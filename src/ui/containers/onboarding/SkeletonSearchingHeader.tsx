import { FC, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../../constants/margins';
import { CustomText } from '../../components';
import { CustomTheme } from '../../Theme';

export const SkeletonSearchingHeader: FC = () => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const textAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const textLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(textAnim, { duration: 900, toValue: 1, useNativeDriver: true }),
                Animated.timing(textAnim, { duration: 900, toValue: 0.4, useNativeDriver: true }),
            ]),
        );
        textLoop.start();

        return () => {
            textLoop.stop();
        };
    }, [textAnim]);

    return (
        <Animated.View style={[styles.header, { opacity: textAnim }]}>
            <CustomText style={styles.headerText} weight={'SemiBold'}>
                {t('word_selection.searching')}
            </CustomText>
        </Animated.View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        header: {
            alignItems: 'center',
            paddingVertical: MARGIN_VERTICAL,
        },
        headerText: {
            color: colors.primary300,
            fontSize: 13,
        },
    });
