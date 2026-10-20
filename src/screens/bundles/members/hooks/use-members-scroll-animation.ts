import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';

import {
    MEMBERS_BOTTOM_PANEL_OPACITY_DURATION,
    MEMBERS_BOTTOM_PANEL_SHOW_OFFSET,
    MEMBERS_SCROLL_TO_TOP_ANIM_DURATION,
    MEMBERS_SCROLL_TO_TOP_THRESHOLD,
} from '../constants';

interface UseMembersScrollAnimationResult<TItem> {
    bottomPanelOpacity: Animated.Value;
    handleHeaderButtonLayout: (event: LayoutChangeEvent) => void;
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    handleScrollToTop: () => void;
    isBottomPanelVisible: boolean;
    listRef: RefObject<FlatList<TItem> | null>;
    scrollToTopAnim: Animated.Value;
    scrollY: Animated.Value;
}

export const useMembersScrollAnimation = <TItem>(): UseMembersScrollAnimationResult<TItem> => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollToTopAnim = useRef(new Animated.Value(0)).current;
    const bottomPanelOpacity = useRef(new Animated.Value(0)).current;
    const scrollToTopVisible = useRef(false);
    const listRef = useRef<FlatList<TItem>>(null);
    const headerButtonBottomRef = useRef<number | undefined>(undefined);

    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);

    useEffect(() => {
        Animated.timing(bottomPanelOpacity, {
            duration: MEMBERS_BOTTOM_PANEL_OPACITY_DURATION,
            toValue: isBottomPanelVisible ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isBottomPanelVisible, bottomPanelOpacity]);

    // Fades the "scroll to top" button in/out, but only when its visibility
    // actually flips, so we don't restart the animation on every scroll tick.
    const updateScrollToTopVisibility = useCallback(
        (offsetY: number) => {
            const shouldShow = offsetY > MEMBERS_SCROLL_TO_TOP_THRESHOLD;
            if (shouldShow === scrollToTopVisible.current) return;

            scrollToTopVisible.current = shouldShow;
            Animated.timing(scrollToTopAnim, {
                duration: MEMBERS_SCROLL_TO_TOP_ANIM_DURATION,
                toValue: shouldShow ? 1 : 0,
                useNativeDriver: true,
            }).start();
        },
        [scrollToTopAnim],
    );

    // Shows the docked action panel once the scroll passes the header button,
    // so it never overlaps with the one still visible in the list header.
    const updateBottomPanelVisibility = useCallback((offsetY: number) => {
        if (headerButtonBottomRef.current === undefined) return;

        const shouldShow =
            offsetY > headerButtonBottomRef.current + MEMBERS_BOTTOM_PANEL_SHOW_OFFSET;
        setIsBottomPanelVisible(prev => (prev === shouldShow ? prev : shouldShow));
    }, []);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            scrollY.setValue(offsetY);
            updateScrollToTopVisibility(offsetY);
            updateBottomPanelVisibility(offsetY);
        },
        [scrollY, updateScrollToTopVisibility, updateBottomPanelVisibility],
    );

    const handleScrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, []);

    const handleHeaderButtonLayout = useCallback((event: LayoutChangeEvent) => {
        const { height, y } = event.nativeEvent.layout;
        headerButtonBottomRef.current = y + height;
    }, []);

    return {
        bottomPanelOpacity,
        handleHeaderButtonLayout,
        handleScroll,
        handleScrollToTop,
        isBottomPanelVisible,
        listRef,
        scrollToTopAnim,
        scrollY,
    };
};
