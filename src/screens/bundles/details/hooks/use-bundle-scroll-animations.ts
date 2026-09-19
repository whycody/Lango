import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashListRef } from '@shopify/flash-list';

import {
    BOTTOM_PANEL_OPACITY_DURATION,
    BOTTOM_PANEL_SHOW_OFFSET,
    CONTENT_APPEAR_DURATION,
    SCROLL_TO_TOP_ANIM_DURATION,
    SCROLL_TO_TOP_THRESHOLD,
} from '../constants';
import { BundleListItem } from '../types';

export const useBundleScrollAnimations = () => {
    const contentAppear = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollToTopAnim = useRef(new Animated.Value(0)).current;
    const bottomPanelOpacity = useRef(new Animated.Value(0)).current;
    const listRef = useRef<FlashListRef<BundleListItem>>(null);
    const scrollToTopVisible = useRef(false);
    const headerButtonsBottomRef = useRef<number | undefined>(undefined);
    const headerHeightRef = useRef<number | undefined>(undefined);

    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
    const [isSubheaderStuck, setIsSubheaderStuck] = useState(false);

    useEffect(() => {
        Animated.timing(contentAppear, {
            duration: CONTENT_APPEAR_DURATION,
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }, [contentAppear]);

    useEffect(() => {
        Animated.timing(bottomPanelOpacity, {
            duration: BOTTOM_PANEL_OPACITY_DURATION,
            toValue: isBottomPanelVisible ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isBottomPanelVisible, bottomPanelOpacity]);

    // Fades the "scroll to top" button in/out, but only when its visibility
    // actually flips, so we don't restart the animation on every scroll tick.
    const updateScrollToTopVisibility = useCallback(
        (offsetY: number) => {
            const shouldShow = offsetY > SCROLL_TO_TOP_THRESHOLD;
            if (shouldShow === scrollToTopVisible.current) return;

            scrollToTopVisible.current = shouldShow;
            Animated.timing(scrollToTopAnim, {
                duration: SCROLL_TO_TOP_ANIM_DURATION,
                toValue: shouldShow ? 1 : 0,
                useNativeDriver: true,
            }).start();
        },
        [scrollToTopAnim],
    );

    // Sticks the subheader once the scroll passes the header's measured height.
    const updateSubheaderStuck = useCallback((offsetY: number) => {
        if (headerHeightRef.current === undefined) return;

        const shouldStick = offsetY > headerHeightRef.current;
        setIsSubheaderStuck(prev => (prev === shouldStick ? prev : shouldStick));
    }, []);

    // Shows the docked action panel once the scroll passes the header buttons.
    const updateBottomPanelVisibility = useCallback((offsetY: number) => {
        if (headerButtonsBottomRef.current === undefined) return;

        const shouldShow = offsetY > headerButtonsBottomRef.current + BOTTOM_PANEL_SHOW_OFFSET;
        setIsBottomPanelVisible(prev => (prev === shouldShow ? prev : shouldShow));
    }, []);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            scrollY.setValue(offsetY);

            updateScrollToTopVisibility(offsetY);
            updateSubheaderStuck(offsetY);
            updateBottomPanelVisibility(offsetY);
        },
        [scrollY, updateScrollToTopVisibility, updateSubheaderStuck, updateBottomPanelVisibility],
    );

    const handleScrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, []);

    const handleHeaderButtonsLayout = useCallback((event: LayoutChangeEvent) => {
        const { height, y } = event.nativeEvent.layout;
        headerButtonsBottomRef.current = y + height;
    }, []);

    const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
        headerHeightRef.current = event.nativeEvent.layout.height;
    }, []);

    return {
        bottomPanelOpacity,
        contentAppear,
        handleHeaderButtonsLayout,
        handleHeaderLayout,
        handleScroll,
        handleScrollToTop,
        isBottomPanelVisible,
        isSubheaderStuck,
        listRef,
        scrollToTopAnim,
        scrollY,
    };
};
