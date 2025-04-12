import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useState } from "react";

GoogleSignin.configure({
  webClientId: process.env["GOOGLE_WEB_CLIENT_ID"],
  androidClientId: process.env["GOOGLE_ANDROID_CLIENT_ID_TEST"],
  iosClientId: process.env["GOOGLE_IOS_CLIENT_ID"],
  scopes: ['profile', 'email'],
});

const GoogleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  return userInfo;
};

const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await GoogleLogin();
      const { idToken, user } = response;

      if (idToken) {
        console.log(idToken, user);
        // const resp = await authAPI.validateToken({
        //   token: idToken,
        //   email: user.email,
        // });
        // await handlePostLoginData(resp.data);
      }
    } catch (apiError) {
      setError(
        apiError?.response?.data?.error?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <CustomText weight={'Bold'} style={styles.headerText}>Zaloguj się</CustomText>
      <ActionButton label={'Zaloguj z Google'} primary={true} style={{ marginTop: 40 }} icon={'logo-google'} onPress={handleGoogleLogin}/>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 24,
  }
});

export default LoginScreen;