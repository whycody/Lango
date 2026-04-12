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
    const [isFlipped, setIsFlipped] = useState(Boolean(flip));
    const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressBlockedUntilRef = useRef(0);
    const rotate = useRef(new Animated.Value(Number(Boolean(flip)))).current;

    useEffect(() => {
        if (!isControlled) return;
        if (flip === undefined) return;
        const next = Boolean(flip);
        if (next === isFlipped) return;
        setIsFlipped(next);
        Animated.spring(rotate, {
            friction,
            toValue: Number(next),
            useNativeDriver,
        }).start(() => onFlipEnd?.(next));
    }, [flip, friction, isControlled, onFlipEnd, rotate, useNativeDriver]);

    useEffect(
        () => () => {
            if (lockTimeoutRef.current) {
                clearTimeout(lockTimeoutRef.current);
                lockTimeoutRef.current = null;
            }
        },
        [],
    );

    const toggle = () => {
        const now = Date.now();
        if (!clickable || now < pressBlockedUntilRef.current) return;
        pressBlockedUntilRef.current = now + 250;
        const next = !isFlipped;
        onFlipStart?.(isFlipped);

        if (isControlled) {
            setIsFlipped(next);
            Animated.spring(rotate, {
                friction,
                toValue: Number(next),
                useNativeDriver,
            }).start(() => onFlipEnd?.(next));
            if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
            lockTimeoutRef.current = setTimeout(() => {
                pressBlockedUntilRef.current = Date.now();
            }, 300);
            return;
        }

        setIsFlipped(next);
        Animated.spring(rotate, {
            friction,
            toValue: Number(next),
            useNativeDriver,
        }).start(() => onFlipEnd?.(next));
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
