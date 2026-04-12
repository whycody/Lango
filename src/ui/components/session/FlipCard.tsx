import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type FlipCardProps = {
    children: [ReactNode, ReactNode] | ReactNode[];
    clickable?: boolean;
    flip?: boolean;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    friction?: number;
    onFlipEnd?: (isFlipped: boolean) => void;
    onFlipStart?: (isFlipped: boolean) => void;
    perspective?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    useNativeDriver?: boolean;
};

export const FlipCard = ({
    children,
    clickable = true,
    flip,
    flipHorizontal = false,
    flipVertical = true,
    friction = 6,
    onFlipEnd,
    onFlipStart,
    perspective = 1000,
    style,
    testID,
    useNativeDriver = true,
}: FlipCardProps) => {
    const sides = React.Children.toArray(children);
    const isControlled = flip !== undefined;
    const [isFlipped, setIsFlipped] = useState(flip);
    const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLockedRef = useRef(false);
    const rotate = useRef(new Animated.Value(Number(Boolean(flip)))).current;

    const clearUnlockTimeout = () => {
        if (!unlockTimeoutRef.current) return;
        clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = null;
    };

    const animateToFlip = (next: boolean) => {
        setIsFlipped(next);
        Animated.spring(rotate, {
            friction,
            toValue: Number(next),
            useNativeDriver,
        }).start(() => onFlipEnd?.(next));
    };

    useEffect(() => {
        if (!isControlled) return;
        if (flip === isFlipped) return;
        animateToFlip(flip);
    }, [flip, friction, isControlled, onFlipEnd, rotate, useNativeDriver]);

    useEffect(
        () => () => {
            clearUnlockTimeout();
        },
        [],
    );

    const toggle = () => {
        if (!clickable || isLockedRef.current) return;
        isLockedRef.current = true;
        const next = !isFlipped;
        onFlipStart?.(isFlipped);

        animateToFlip(next);

        clearUnlockTimeout();
        unlockTimeoutRef.current = setTimeout(() => {
            isLockedRef.current = false;
        }, 300);
    };

    const [frontTransform, backTransform] = useMemo(() => {
        const front = [] as ({ perspective: number } | { rotateX: any } | { rotateY: any })[];
        const back = [] as ({ perspective: number } | { rotateX: any } | { rotateY: any })[];

        front.push({ perspective });
        back.push({ perspective });

        if (flipHorizontal) {
            front.push({
                rotateY: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                }),
            });
            back.push({
                rotateY: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['180deg', '360deg'],
                }),
            });
        }

        if (flipVertical) {
            front.push({
                rotateX: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                }),
            });
            back.push({
                rotateX: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['180deg', '360deg'],
                }),
            });
        }

        return [front, back];
    }, [flipHorizontal, flipVertical, perspective, rotate]);

    return (
        <Pressable style={[styles.root, style]} testID={testID} onPress={toggle}>
            <Animated.View
                pointerEvents={isFlipped ? 'none' : 'auto'}
                style={[styles.side, { transform: frontTransform }]}
            >
                <View style={styles.inner}>{sides[0]}</View>
            </Animated.View>

            <Animated.View
                pointerEvents={isFlipped ? 'auto' : 'none'}
                style={[styles.side, { transform: backTransform }]}
            >
                <View style={styles.inner}>{sides[1]}</View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    inner: {
        flex: 1,
    },
    root: {
        flex: 1,
        position: 'relative',
    },
    side: {
        ...StyleSheet.absoluteFillObject,
        backfaceVisibility: 'hidden',
        position: 'absolute',
    },
});
