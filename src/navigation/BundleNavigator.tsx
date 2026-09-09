import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { BundleDetailsScreen } from '../ui/screens/bundles/BundleDetailsScreen';
import {
    BundleNavigatorParams,
    BundleStackParamList,
    RootStackParamList,
    ScreenName,
} from './navigationTypes';

const Stack = createNativeStackNavigator<BundleStackParamList>();

type BundleNavigatorProps = NativeStackScreenProps<RootStackParamList, ScreenName.BundleNavigator>;

const BundleNavigator = ({ route }: BundleNavigatorProps) => {
    // When this screen is reached via a deep link, React Navigation resolves
    // the path (`bundle/:bundleId`) into the nested `BundleFlashcards`
    // route's params, delivered here as `route.state`, not `route.params`.
    // `route.params` is only populated for direct in-app navigation (e.g.
    // tapping a bundle in the list).
    const routeWithState = route as typeof route & {
        state?: { routes: Array<{ params?: BundleNavigatorParams }> };
    };
    const deepLinkedParams = routeWithState.state?.routes[0]?.params;
    const { bundleId, code, isNewBundle, justJoined, previewBundle } =
        route.params ?? deepLinkedParams ?? {};

    return (
        <Stack.Navigator
            initialRouteName={ScreenName.BundleFlashcards}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                component={BundleDetailsScreen}
                initialParams={{ bundleId, code, isNewBundle, justJoined, previewBundle }}
                name={ScreenName.BundleFlashcards}
            />
        </Stack.Navigator>
    );
};

export default BundleNavigator;
