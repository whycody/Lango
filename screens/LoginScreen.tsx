import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";

const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
     <CustomText weight={'Bold'} style={styles.headerText}>Zaloguj się</CustomText>
      <ActionButton label={'Zaloguj z Google'} primary={true} style={{ marginTop: 40 }} icon={'logo-google'} />
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