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
import { CustomTheme } from '../../Theme';
import { CustomText, SquareFlag } from '..';

type WordInputProps = TextInputProps & {
    active: boolean;
    id: string;
    languageCode: LanguageCode;
    onMicrophonePermissionsNotGranted?: () => void;
    onWordChange?: (word: string) => void;
    style?: StyleProp<ViewStyle>;
    suggestions?: string[];
    word: string;
};

type WordInputRef = {
    focus: () => void;
};

export const WordInput = forwardRef<WordInputRef, WordInputProps>((props, ref) => {
    const {
        active,
        id,
        languageCode,
        onMicrophonePermissionsNotGranted,
        onWordChange,
        style,
        suggestions,
        word,
        ...rest
    } = props;

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

    const voice = useVoiceInput({
        id,
        languageCode,
        onPermissionDenied: onMicrophonePermissionsNotGranted,
        onResult: text => {
            trackEvent(AnalyticsEventName.MICROPHONE_WORD_INPUT);
            onWordChange?.(text);
        },
    });

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
    }));

    const handleTextChange = (newWord: string) => {
        if (!active) return;
        onWordChange?.(newWord);
    };

    const handleBlur = () => {
        setFocused(false);
    };

    const handleSuggestionPress = (suggestion: string) => {
        onWordChange?.(suggestion);
    };

    return (
        <View>
            <View style={[styles.root, style]}>
                <SquareFlag languageCode={languageCode} size={30} style={styles.flag} />
                <View style={styles.inputContainer}>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={true}
                        cursorColor={active ? colors.primary : 'transparent'}
                        multiline={true}
                        placeholderTextColor={colors.cardAccent}
                        ref={inputRef}
                        scrollEnabled={true}
                        style={styles.input}
                        textContentType={'none'}
                        value={word}
                        placeholder={
                            focused || !filteredSuggestions.length
                                ? undefined
                                : filteredSuggestions[0]
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
            {filteredSuggestions.length > 0 && focused && (
                <FlatList
                    data={filteredSuggestions}
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
