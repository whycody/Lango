import { FC } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { trackEvent } from '../../utils/analytics';
import { getStoreUrl } from '../../utils/versionUtils';
import { ActionButton, CustomText, Header, VersionFooter } from '../components';
import { CustomTheme } from '../Theme';

type UpdateAppScreenProps = {
    required: boolean;
    onAskLater?: () => void;
};

export const UpdateAppScreen: FC<UpdateAppScreenProps> = ({ onAskLater, required }) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    const openStore = () => {
        trackEvent(AnalyticsEventName.UPDATE_APP_STORE_OPEN);
        Linking.openURL(getStoreUrl());
    };

    return (
        <View
            style={[
                styles.root,
                { paddingBottom: MARGIN_VERTICAL + insets.bottom, paddingTop: insets.top },
            ]}
        >
            <View style={styles.content}>
                <Header centered subtitle={t('update_app_desc')} title={t('update_app_title')} />
            </View>
            <LottieView
                autoPlay={true}
                loop={true}
                source={require('../../../assets/rocket.json')}
                style={styles.lottie}
            />
            <View>
                <ActionButton label={t('update_app_action')} primary={true} onPress={openStore} />
                {!required && (
                    <Pressable onPress={onAskLater}>
                        <CustomText style={styles.laterText} weight="SemiBold">
                            {t('ask_later')}
                        </CustomText>
                    </Pressable>
                )}
            </View>
            <VersionFooter small style={styles.versionFooter} />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        content: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        laterText: {
            color: colors.white,
            fontSize: 13,
            paddingTop: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        lottie: {
            height: 270,
            marginBottom: -1.5,
            pointerEvents: 'none',
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        versionFooter: {
            paddingTop: MARGIN_VERTICAL,
        },
    });
