import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useDynamicStatusBar(maxScroll = 100, maxOpacity = 0.2) {
    const [scrollY, setScrollY] = useState(0);
    const insets = useSafeAreaInsets();

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollY(e.nativeEvent.contentOffset.y);
    };

    const opacity = Math.min(scrollY / maxScroll, maxOpacity);
    const backgroundColor = `rgba(0,0,0,${opacity})`;

    const style: ViewStyle = {
        backgroundColor,
        height: insets.top,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 100,
    };

    return { onScroll, style };
}
