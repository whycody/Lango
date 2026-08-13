import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { BundleDetailsScreen } from '../ui/screens/bundles/BundleDetailsScreen';
import { BundleStackParamList, RootStackParamList, ScreenName } from './navigationTypes';

const Stack = createNativeStackNavigator<BundleStackParamList>();

type BundleNavigatorProps = NativeStackScreenProps<RootStackParamList, ScreenName.BundleNavigator>;

const BundleNavigator = ({ route }: BundleNavigatorProps) => {
    // When this screen is reached via a deep link, React Navigation passes
    // the nested navigator's state through `route.state` (not
    // `route.params`) so that the inner Stack.Navigator below hydrates its
    // own initial state from it automatically. `route.params` is only used
    // for direct in-app navigation (e.g. tapping a bundle in the list).
    const { bundleId, code, isNewBundle, previewBundle } = route.params ?? {};

    return (
        <Stack.Navigator
            initialRouteName={ScreenName.BundleFlashcards}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                component={BundleDetailsScreen}
                initialParams={{ bundleId, code, isNewBundle, previewBundle }}
                name={ScreenName.BundleFlashcards}
            />
        </Stack.Navigator>
    );
};

export default BundleNavigator;
