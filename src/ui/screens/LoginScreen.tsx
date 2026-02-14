import { useTheme } from "@react-navigation/native";
import { Platform, StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { FC } from "react";
import { MARGIN_VERTICAL } from "../../constants/margins";
import { expo } from '../../../app.json'
import { useTranslation } from "react-i18next";
import MarqueeRow from "../components/login/MovingWordsGrid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoginProps = {
  login: (method: "Google" | "Facebook" | "Apple") => Promise<void>;
  loading: "Google" | "Facebook" | "Apple" | false;
  authError: string | null;
}

const LoginScreen: FC<LoginProps> = ({ login, loading, authError }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: MARGIN_VERTICAL * 2 + insets.top, paddingBottom: MARGIN_VERTICAL * 2 + insets.bottom }]}>
      <View style={{ flex: 3 }}>
        <MarqueeRow loading={!!loading} words={['taal', 'ቋንቋ', 'jezik', 'lingua', 'sprooch', 'lingwa']} reverse={false}/>
        <MarqueeRow loading={!!loading} words={['keel', 'jazyk', 'nyelv', 'язык', 'језик', 'ژبه']} reverse={true}/>
        <MarqueeRow loading={!!loading} words={['sprache', 'tungumál', 'linguaggio', 'cànan', 'gjuhe', 'لغة']} reverse={false}/>
        <MarqueeRow loading={!!loading} words={['ulimi', 'lokota', 'olulimi', 'polelo', 'język', 'puo']} reverse={true}/>
        <MarqueeRow loading={!!loading} words={['luqadda', 'mutauro', 'chilankhulo', 'fiteny', 'asụsụ', 'harshe']} reverse={false}/>
      </View>
      <View style={styles.contentContainer}>
        <CustomText weight={'Bold'} style={styles.subheaderText}>{t('welcome_to').toUpperCase()}</CustomText>
        <CustomText weight={'Bold'} style={styles.headerText}>{expo.name}</CustomText>
        <CustomText style={styles.text}>{t('welcome_desc')}</CustomText>
        <View style={{ flex: 1 }} />
        <ActionButton
          label={t('login_with_google')}
          primary={true}
          style={styles.button}
          icon={'logo-google'}
          onPress={() => login('Google')}
          loading={loading === 'Google'}
        />
        <ActionButton
          label={t('login_with_facebook')}
          primary={true}
          style={styles.button}
          icon={'logo-facebook'}
          onPress={() => login('Facebook')}
          loading={loading === 'Facebook'}
        />
        {Platform.OS == 'ios' && (
          <ActionButton
            label={t('login_with_apple')}
            primary={true}
            style={styles.button}
            icon={'logo-apple'}
            onPress={() => login('Apple')}
            loading={loading === 'Apple'}
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: MARGIN_VERTICAL * 2,
    paddingTop: MARGIN_VERTICAL * 2,
    backgroundColor: colors.background
  },
  contentContainer: {
    flex: 3,
    marginTop: 40,
    marginHorizontal: MARGIN_VERTICAL,
  },
  subheaderText: {
    color: colors.primary300,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: -15,
  },
  headerText: {
    color: colors.primary300,
    textAlign: 'center',
    fontSize: 48,
  },
  text: {
    color: colors.primary600,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    marginTop: 15,
    height: 45,
  }
});

export default LoginScreen;