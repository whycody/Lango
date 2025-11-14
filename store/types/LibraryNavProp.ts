import { CompositeNavigationProp, NavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../../navigation/TabsNavigator";
import { RootStackParamList } from "../../navigation/AppStack";

export type LibraryNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabsParamList, "Library">,
  NavigationProp<RootStackParamList>
>;