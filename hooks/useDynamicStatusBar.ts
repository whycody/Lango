import { NativeScrollEvent, NativeSyntheticEvent, ViewStyle } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useDynamicStatusBar(maxScroll = 100, maxOpacity = 0.2) {
  const [scrollY, setScrollY] = useState(0);
  const insets = useSafeAreaInsets();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  const opacity = Math.min(scrollY / maxScroll, maxOpacity);
  const backgroundColor = `rgba(0,0,0,${opacity})`;

  const style: ViewStyle = {
    backgroundColor: backgroundColor,
    position: 'absolute',
    height: insets.top,
    zIndex: 100,
    top: 0,
    left: 0,
    right: 0,
  }

  return { style, onScroll };
}