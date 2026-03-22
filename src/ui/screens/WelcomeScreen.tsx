import React, { FC, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { useAuth } from '../../store';
import { CustomText } from '../components';

interface WelcomeScreenProps {
    onAnimationEnd?: () => void;
}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({ onAnimationEnd }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [displayedText, setDisplayedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
    const subtitleSlideAnim = useRef(new Animated.Value(20)).current;
    const titleMarginAnim = useRef(new Animated.Value(0)).current;
    const confettiRef = useRef<LottieView>();

    const nameLength = user.name ? user.name.split(' ')[0].length : 0;
    const fullText = t('welcome_onboarding', { name: user.name.split(' ')[0] });

    const showConfetti = () => {
        setTimeout(() => {
            confettiRef.current?.play(0);
        }, 300);
    };

    useEffect(() => {
        setDisplayedText('');
        let currentIndex = 0;
        let typeInterval: ReturnType<typeof setTimeout> | null;

        const startTyping = () => {
            typeInterval = setInterval(() => {
                if (currentIndex <= fullText.length) {
                    setDisplayedText(fullText.substring(0, currentIndex));
                    currentIndex++;
                } else {
                    onAnimationEnd?.();
                    setDisplayedText(text => text + ' \uD83C\uDF89');
                    clearInterval(typeInterval);
                    showConfetti();
                }
            }, 130);
        };

        const delayTimeout = setTimeout(startTyping, 500);

        return () => {
            clearTimeout(delayTimeout);
            clearInterval(typeInterval);
        };
    }, [fullText]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
        if (displayedText.length === fullText.length) {
            const animationDuration = 500;
            subtitleFadeAnim.setValue(0);
            subtitleSlideAnim.setValue(20);

            Animated.sequence([
                Animated.delay(500),
                Animated.parallel([
                    Animated.timing(subtitleFadeAnim, {
                        duration: animationDuration,
                        easing: Easing.out(Easing.quad),
                        toValue: 1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(subtitleSlideAnim, {
                        duration: animationDuration,
                        easing: Easing.out(Easing.quad),
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [displayedText.length, fullText.length, subtitleFadeAnim, subtitleSlideAnim]);

    return (
        <View style={styles.root}>
            <Text style={[styles.title, { marginBottom: titleMarginAnim }]}>
                <Text style={styles.name}>{displayedText.slice(0, nameLength + 1)}</Text>
                <Text style={styles.text}>
                    {displayedText.slice(nameLength + 1)}
                    <Text style={!showCursor && { color: 'transparent' }}>|</Text>
                </Text>
            </Text>
            <Animated.View
                style={{
                    opacity: subtitleFadeAnim,
                    transform: [{ translateY: subtitleSlideAnim }],
                }}
            >
                <CustomText style={styles.subtitle} weight="Regular">
                    {t('welcome_onboarding_desc')}
                </CustomText>
            </Animated.View>

            <View style={styles.lottieWrapper}>
                <LottieView
                    autoPlay={false}
                    loop={false}
                    ref={confettiRef}
                    source={require('../../../assets/confetti.json')}
                    style={styles.lottie}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        lottie: {
            height: '100%',
            pointerEvents: 'none',
            width: '100%',
        },
        lottieWrapper: {
            bottom: 0,
            left: 0,
            pointerEvents: 'none',
            position: 'absolute',
            right: 0,
            top: 0,
        },
        name: {
            backgroundColor: colors.card,
        },
        root: {
            height: '100%',
            justifyContent: 'center',
            paddingBottom: 20,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 14,
            marginHorizontal: MARGIN_HORIZONTAL * 3,
            textAlign: 'center',
        },
        text: {
            backgroundColor: colors.card,
        },
        title: {
            color: colors.primary300,
            fontFamily: 'Montserrat-Bold',
            fontSize: 26,
            marginBottom: 40,
            textAlign: 'center',
        },
    });
