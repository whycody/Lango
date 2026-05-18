import React, { FC } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { CustomText } from '../../components/CustomText';
import { CustomTheme } from '../../Theme';

type LoadingViewProps = {};

export const LoadingView: FC<LoadingViewProps> = () => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    return (
        <View style={styles.root}>
            <View style={styles.content}>
                <ActivityIndicator color={colors.white} size="large" />
                <CustomText style={styles.headerText} weight={'Bold'}>
                    {t('loading_content')}
                </CustomText>
                <CustomText style={styles.descText}>{t('loading_content_desc')}</CustomText>
            </View>
            <Image
                resizeMode="contain"
                source={require('../../../../assets/lango-logo.png')}
                style={styles.image}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        content: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            paddingTop: 90,
        },
        descText: {
            color: colors.white300,
            fontSize: 14,
            marginHorizontal: MARGIN_HORIZONTAL * 2,
            paddingTop: 5,
            textAlign: 'center',
        },
        headerText: {
            color: colors.white,
            fontSize: 17,
            paddingTop: 30,
            textAlign: 'center',
        },
        image: {
            alignSelf: 'center',
            height: 40,
            paddingBottom: 50,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            paddingBottom: insets.bottom + 50,
            paddingTop: insets.top,
        },
    });
