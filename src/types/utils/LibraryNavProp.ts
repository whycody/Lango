import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigationProp } from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/navigationTypes';
import { TabsParamList } from '../../navigation/TabsNavigator';

export type LibraryNavProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabsParamList, 'Library'>,
    NavigationProp<RootStackParamList>
>;
