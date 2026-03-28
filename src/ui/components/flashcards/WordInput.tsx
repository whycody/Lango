import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleProp,
    StyleSheet,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { LanguageCode } from '../../../constants/Language';
import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { useVoiceInput } from '../../../hooks';
import { trackEvent } from '../../../utils/analytics';
import { CustomText, SquareFlag } from '..';

type WordInputProps = TextInputProps & {
    active: boolean;
    id: string;
    languageCode: LanguageCode;
    onMicrophonePermissionsNotGranted?: () => void;
    onWordChange?: (word: string) => void;
    onWordCommit?: (word: string) => void;
    style?: StyleProp<ViewStyle>;
    suggestions?: string[];
    word: string;
};

type WordInputRef = {
    clearWord: () => void;
    focus: () => void;
    getWord: () => string;
};

export const WordInput = forwardRef<WordInputRef, WordInputProps>((props, ref) => {
    const {
        active,
        id,
        languageCode,
        onMicrophonePermissionsNotGranted,
        onWordChange,
        onWordCommit,
        style,
        suggestions,
        word,
        ...rest
    } = props;
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [focused, setFocused] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [internalWord, setInternalWord] = useState(word);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const inputRef = useRef<any>(null);

    const voice = useVoiceInput({
        id,
        languageCode,
        onEnd: (result: string) => {
            onWordCommit?.(result);
        },
        onPermissionDenied: onMicrophonePermissionsNotGranted,
        onResult: text => {
            trackEvent(AnalyticsEventName.MICROPHONE_WORD_INPUT);
            setInternalWord(text);
            onWordChange?.(text);
        },
    });

    useImperativeHandle(ref, () => ({
        clearWord: () => setInternalWord(''),
        focus: () => inputRef.current?.focus(),
        getWord: () => internalWord,
    }));

    useEffect(() => {
        const filteredSuggestions = suggestions
            ? suggestions
                  .filter(
                      suggestion =>
                          suggestion.toLowerCase().startsWith(internalWord.toLowerCase()) &&
                          suggestion.toLowerCase() !== internalWord.toLowerCase(),
                  )
                  .slice(0, 2)
            : [];

        setCurrentSuggestions(filteredSuggestions);
    }, [internalWord, suggestions]);

    const handleTextChange = (newWord: string) => {
        if (!active) return;

        setInternalWord(newWord);
        onWordChange?.(newWord);

        if (voice.recording) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onWordCommit?.(newWord);
        }, 450);
    };

    const handleBlur = () => {
        onWordCommit?.(internalWord);
        setFocused(false);
    };

    const handleSuggestionPress = (suggestion: string) => {
        setCurrentSuggestions([]);
        setInternalWord(suggestion);
        onWordChange(suggestion);
        onWordCommit(suggestion);
    };

    return (
        <View>
            <View style={[styles.root, style]}>
                <SquareFlag languageCode={languageCode} size={30} style={styles.flag} />
                <View style={styles.inputContainer}>
                    <BottomSheetTextInput
                        autoCapitalize={'none'}
                        autoCorrect={true}
                        cursorColor={active ? colors.primary : 'transparent'}
                        multiline={true}
                        placeholderTextColor={colors.cardAccent}
                        ref={inputRef}
                        scrollEnabled={true}
                        style={styles.input}
                        textContentType={'none'}
                        value={internalWord}
                        placeholder={
                            currentSuggestions && !focused && currentSuggestions
                                ? currentSuggestions[0]
                                : undefined
                        }
                        onBlur={handleBlur}
                        onChangeText={handleTextChange}
                        onFocus={() => setFocused(true)}
                        {...rest}
                    />
                    <Ionicons
                        color={voice.recording ? colors.primary : colors.primary600}
                        name={'mic-sharp'}
                        size={24}
                        style={styles.icon}
                        onPress={voice.toggle}
                    />
                </View>
            </View>
            {currentSuggestions.length > 0 && focused && (
                <FlatList
                    data={currentSuggestions}
                    keyExtractor={index => index.toString()}
                    keyboardShouldPersistTaps={'always'}
                    scrollEnabled={false}
                    style={styles.suggestionsList}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleSuggestionPress(item)}>
                            <View style={styles.suggestionItem}>
                                <CustomText style={styles.suggestionText}>{item}</CustomText>
                            </View>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
});

const getStyles = (colors: any) =>
    StyleSheet.create({
        flag: {
            marginRight: 10,
        },
        icon: {
            padding: 6.5,
        },
        input: {
            backgroundColor: colors.background,
            color: colors.primary300,
            flex: 1,
            fontFamily: `Montserrat-Regular`,
            fontSize: 16,
            lineHeight: 30,
            minHeight: 42,
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
        },
        inputContainer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
        },
        root: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        suggestionItem: {
            backgroundColor: colors.background,
            marginTop: 5,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        suggestionsList: {
            borderColor: colors.border,
            marginTop: 10,
        },
        suggestionText: {
            color: colors.primary300,
            fontSize: 14,
        },
    });
