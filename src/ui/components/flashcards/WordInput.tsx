import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { LanguageCode } from '../../../constants/Language';
import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { useVoiceInput } from '../../../hooks';
import { trackEvent } from '../../../utils/analytics';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText, SquareFlag } from '..';

type WordInputProps = TextInputProps & {
    active: boolean;
    languageCode: LanguageCode;
    onWordChange?: (word: string) => void;
    style?: StyleProp<ViewStyle>;
    suggestions?: string[];
    voice: ReturnType<typeof useVoiceInput>;
    voiceId: string;
    word: string;
};

type WordInputRef = {
    focus: () => void;
};

export const WordInput = forwardRef<WordInputRef, WordInputProps>((props, ref) => {
    const {
        active,
        languageCode,
        onWordChange,
        style,
        suggestions,
        voice,
        voiceId,
        word,
        ...rest
    } = props;

    const recording = voice.isRecording(voiceId);
    const micDisabled = voice.recording && !recording;

    const handleMicPress = () => {
        voice.toggle({
            id: voiceId,
            languageCode,
            onResult: text => {
                trackEvent(AnalyticsEventName.MICROPHONE_WORD_INPUT);
                onWordChange?.(text);
            },
        });
    };

    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<any>(null);

    const filteredSuggestions =
        suggestions
            ?.filter(
                s =>
                    s.toLowerCase().startsWith(word.toLowerCase()) &&
                    s.toLowerCase() !== word.toLowerCase(),
            )
            .slice(0, 2) ?? [];

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
    }));

    // Workaround: native `placeholder` on a multiline TextInput (UITextView) does not
    // refresh reliably on iOS inside TrueSheet, so we fake it via `value` + muted color
    // + hidden caret + forced selection. Using the native placeholder prop causes the
    // suggestion to stay stale until the sheet is physically moved.
    const showingSuggestion = !word && !focused && filteredSuggestions.length > 0;
    const displayValue = showingSuggestion ? filteredSuggestions[0] : word;

    const handleTextChange = (newWord: string) => {
        if (!active) return;
        onWordChange?.(newWord);
    };

    const handleBlur = () => {
        setFocused(false);
    };

    return (
        <View>
            <View style={[styles.root, style]}>
                <SquareFlag languageCode={languageCode} size={30} style={styles.flag} />
                <View style={styles.inputContainer}>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={true}
                        caretHidden={showingSuggestion}
                        cursorColor={active ? colors.primary : 'transparent'}
                        multiline={true}
                        ref={inputRef}
                        scrollEnabled={true}
                        selection={!word ? { end: 0, start: 0 } : undefined}
                        textContentType={'none'}
                        value={displayValue}
                        style={[
                            styles.input,
                            isIOS && styles.inputIOS,
                            showingSuggestion && styles.inputAsPlaceholder,
                        ]}
                        onBlur={handleBlur}
                        onChangeText={handleTextChange}
                        onFocus={() => setFocused(true)}
                        {...rest}
                    />
                    <Ionicons
                        name={'mic-sharp'}
                        size={24}
                        style={styles.icon}
                        color={
                            recording
                                ? colors.primary
                                : micDisabled
                                  ? colors.cardAccent
                                  : colors.primary600
                        }
                        onPress={handleMicPress}
                    />
                </View>
            </View>
            {filteredSuggestions.length > 0 && focused && (
                <FlatList
                    data={filteredSuggestions}
                    keyExtractor={index => index.toString()}
                    keyboardShouldPersistTaps={'always'}
                    scrollEnabled={false}
                    style={styles.suggestionsList}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => onWordChange?.(item)}>
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

const getStyles = (colors: CustomTheme['colors']) =>
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
            lineHeight: 21,
            minHeight: 42,
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
        },
        inputAsPlaceholder: {
            color: colors.cardAccent,
        },
        inputContainer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL / 2,
        },
        inputIOS: {
            paddingVertical: 10,
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
