import { FC } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { expo } from '../../../app.json';
import { MARGIN_VERTICAL } from '../../constants/margins';
import { UserProvider } from '../../constants/User';
import { ActionButton, CustomText, VersionFooter } from '../components';
import { MarqueeRow } from '../components/login';

type LoginProps = {
    authError: string | null;
    loading: UserProvider | false;
    login: (method: UserProvider) => Promise<void>;
};

export const LoginScreen: FC<LoginProps> = ({ authError, loading, login }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors);
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.root,
                {
                    paddingBottom: MARGIN_VERTICAL + insets.bottom,
                    paddingTop: MARGIN_VERTICAL * 2 + insets.top,
                },
            ]}
        >
            <View style={styles.marqueesContainer}>
                <MarqueeRow
                    loading={!!loading}
                    reverse={false}
                    words={['taal', 'ቋንቋ', 'jezik', 'lingua', 'sprooch', 'lingwa']}
                />
                <MarqueeRow
                    loading={!!loading}
                    reverse={true}
                    words={['keel', 'jazyk', 'nyelv', 'язык', 'језик', 'ژبه']}
                />
                <MarqueeRow
                    loading={!!loading}
                    reverse={false}
                    words={['sprache', 'tungumál', 'linguaggio', 'cànan', 'gjuhe', 'لغة']}
                />
                <MarqueeRow
                    loading={!!loading}
                    reverse={true}
                    words={['ulimi', 'lokota', 'olulimi', 'polelo', 'język', 'puo']}
                />
                <MarqueeRow
                    loading={!!loading}
                    reverse={false}
                    words={['luqadda', 'mutauro', 'chilankhulo', 'fiteny', 'asụsụ', 'harshe']}
                />
            </View>
            <View style={styles.contentContainer}>
                <CustomText style={styles.subheaderText} weight={'Bold'}>
                    {t('welcome_to').toUpperCase()}
                </CustomText>
                <CustomText style={styles.headerText} weight={'Bold'}>
                    {expo.name}
                </CustomText>
                <CustomText style={styles.text}>{t('welcome_desc')}</CustomText>
                <View style={styles.contentSpacer} />
                {Platform.OS == 'ios' && (
                    <ActionButton
                        icon={'logo-apple'}
                        label={t('login_with_apple')}
                        loading={loading === UserProvider.APPLE}
                        primary={true}
                        style={styles.button}
                        onPress={() => login(UserProvider.APPLE)}
                    />
                )}
                <ActionButton
                    icon={'logo-google'}
                    label={t('login_with_google')}
                    loading={loading === UserProvider.GOOGLE}
                    primary={true}
                    style={styles.button}
                    onPress={() => login(UserProvider.GOOGLE)}
                />
                <ActionButton
                    icon={'logo-facebook'}
                    label={t('login_with_facebook')}
                    loading={loading === UserProvider.FACEBOOK}
                    primary={Platform.OS !== 'ios'}
                    style={styles.button}
                    onPress={() => login(UserProvider.FACEBOOK)}
                />
                <CustomText style={styles.errorText} weight={'Regular'}>
                    {authError}
                </CustomText>
                <VersionFooter small={true} />
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        button: {
            height: 45,
            marginBottom: 15,
        },
        contentContainer: {
            flex: 3,
            marginHorizontal: MARGIN_VERTICAL,
            marginTop: 40,
        },
        contentSpacer: {
            flex: 1,
        },
        errorText: {
            color: colors.red,
            fontSize: 12,
            height: 50,
        },
        headerText: {
            color: colors.primary300,
            fontSize: 48,
            textAlign: 'center',
        },
        marqueesContainer: {
            flex: 3,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            paddingBottom: MARGIN_VERTICAL * 2,
            paddingTop: MARGIN_VERTICAL * 2,
        },
        subheaderText: {
            color: colors.primary300,
            fontSize: 14,
            marginBottom: -15,
            textAlign: 'center',
        },
        text: {
            color: colors.primary600,
            fontSize: 14,
            marginVertical: 20,
            textAlign: 'center',
        },
    });
