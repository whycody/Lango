import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { BundleFlashcardsScreen } from '../ui/screens/bundles/BundleFlashcardsScreen';
import { BundleStackParamList, RootStackParamList, ScreenName } from './navigationTypes';

const Stack = createNativeStackNavigator<BundleStackParamList>();

type BundleNavigatorProps = NativeStackScreenProps<RootStackParamList, ScreenName.BundleNavigator>;

const BundleNavigator = ({ route }: BundleNavigatorProps) => {
    const { bundleId } = route.params;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                component={BundleFlashcardsScreen}
                initialParams={{ bundleId }}
                name={ScreenName.BundleFlashcards}
            />
        </Stack.Navigator>
    );
};

export default BundleNavigator;
