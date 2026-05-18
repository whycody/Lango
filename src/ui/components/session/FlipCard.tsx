import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    PanResponder,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

type FlipCardProps = {
    children: [ReactNode, ReactNode] | ReactNode[];
    clickable?: boolean;
    flip?: boolean;
    flipVertical?: boolean;
    friction?: number;
    onFlipEnd?: (isFlipped: boolean) => void;
    onFlipStart?: (isFlipped: boolean) => void;
    perspective?: number;
    style?: StyleProp<ViewStyle>;
    swipeable?: boolean;
    testID?: string;
    useNativeDriver?: boolean;
};

export const FlipCard = ({
    children,
    clickable = true,
    flip,
    flipVertical = false,
    friction = 6,
    onFlipEnd,
    onFlipStart,
    perspective = 1000,
    style,
    swipeable = true,
    testID,
    useNativeDriver = true,
}: FlipCardProps) => {
    const sides = React.Children.toArray(children);
    const isControlled = flip !== undefined;

    const [isFlipped, setIsFlipped] = useState(Boolean(flip));
    const isFlippedRef = useRef(Boolean(flip));

    const rotate = useRef(new Animated.Value(flip ? 1 : 0)).current;
    const rotateValueRef = useRef(flip ? 1 : 0);

    const cardWidthRef = useRef(1);
    const cardHeightRef = useRef(1);
    const panStartValueRef = useRef(0);
    const isLockedRef = useRef(false);

    const swipeableRef = useRef(swipeable);
    swipeableRef.current = swipeable;

    useEffect(() => {
        const id = rotate.addListener(({ value }) => {
            rotateValueRef.current = value;
            const normalized = Math.abs(value % 2);
            const flipped = normalized >= 0.5 && normalized < 1.5;

            if (flipped !== isFlippedRef.current) {
                isFlippedRef.current = flipped;
                setIsFlipped(flipped);
            }
        });
        return () => rotate.removeListener(id);
    }, [rotate]);

    const animateTo = (toValue: number) => {
        isLockedRef.current = true;
        setTimeout(() => {
            isLockedRef.current = false;
        }, 250);
        Animated.spring(rotate, {
            friction,
            toValue,
            useNativeDriver,
        }).start(() => {
            const finalFlipped = Math.round(toValue) % 2 !== 0;
            onFlipEnd?.(finalFlipped);
        });
    };

    const toggle = () => {
        if (!clickable || isLockedRef.current) return;
        isLockedRef.current = true;
        onFlipStart?.(isFlippedRef.current);
        const rotateValue = Math.round(rotateValueRef.current);
        const target = rotateValue + (rotateValue % 2 === 0 ? -1 : 1);
        animateTo(target);
    };

    useEffect(() => {
        if (!isControlled) return;
        const currentFlipped = Math.round(rotateValueRef.current) % 2 !== 0;
        if (flip !== currentFlipped) {
            const rotateValue = Math.round(rotateValueRef.current);
            const target = rotateValue + (rotateValue % 2 === 0 ? -1 : 1);
            animateTo(target);
        }
    }, [flip, isControlled]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, { dx, dy }) =>
                    swipeableRef.current && Math.sqrt(dx * dx + dy * dy) > 10,
                onPanResponderGrant: () => {
                    panStartValueRef.current = rotateValueRef.current;
                    rotate.stopAnimation();
                },
                onPanResponderMove: (_, { dx, dy }) => {
                    if (!swipeableRef.current) return;
                    const axis = flipVertical ? dy : dx;
                    const size = flipVertical ? cardHeightRef.current : cardWidthRef.current;
                    rotate.setValue(panStartValueRef.current - (axis / size) * 1.2);
                },
                onPanResponderRelease: (_, { dx, dy }) => {
                    const axis = flipVertical ? dy : dx;
                    const size = flipVertical ? cardHeightRef.current : cardWidthRef.current;
                    const threshold = size * 0.2;
                    const base = Math.round(panStartValueRef.current);

                    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                        toggle();
                        return;
                    }

                    let target;
                    if (axis < -threshold) {
                        target = base + 1;
                        onFlipStart?.(base % 2 !== 0);
                    } else if (axis > threshold) {
                        target = base - 1;
                        onFlipStart?.(base % 2 !== 0);
                    } else {
                        target = base;
                    }
                    animateTo(target);
                },
                onPanResponderTerminate: () => {
                    animateTo(Math.round(panStartValueRef.current));
                },
                onStartShouldSetPanResponder: () => !isLockedRef.current,
            }),
        [rotate, friction, useNativeDriver, flipVertical, clickable, onFlipStart],
    );

    const rotateFront = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: flipVertical ? ['0deg', '180deg'] : ['0deg', '-180deg'],
    });

    const rotateBack = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: flipVertical ? ['180deg', '360deg'] : ['-180deg', '-360deg'],
    });

    const transformOrigin = (r: Animated.AnimatedInterpolation<string | number>) => {
        return [{ perspective }, flipVertical ? { rotateX: r } : { rotateY: r }];
    };

    const layout = (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
        cardWidthRef.current = e.nativeEvent.layout.width || 1;
        cardHeightRef.current = e.nativeEvent.layout.height || 1;
    };

    const front = (
        <Animated.View
            pointerEvents={isFlipped ? 'none' : 'auto'}
            style={[
                styles.side,
                { opacity: isFlipped ? 0 : 1, transform: transformOrigin(rotateFront) },
            ]}
        >
            {sides[0]}
        </Animated.View>
    );

    const back = (
        <Animated.View
            pointerEvents={isFlipped ? 'auto' : 'none'}
            style={[
                styles.side,
                { opacity: isFlipped ? 1 : 0, transform: transformOrigin(rotateBack) },
            ]}
        >
            {sides[1]}
        </Animated.View>
    );

    if (!swipeable) {
        return (
            <Pressable
                style={style}
                testID={testID}
                onLayout={layout}
                onPress={clickable ? toggle : undefined}
            >
                {front}
                {back}
            </Pressable>
        );
    }

    return (
        <View {...panResponder.panHandlers} style={style} testID={testID} onLayout={layout}>
            {front}
            {back}
        </View>
    );
};

const styles = StyleSheet.create({
    side: {
        ...StyleSheet.absoluteFill,
        backfaceVisibility: 'hidden',
    },
});
