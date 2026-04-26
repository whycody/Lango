import React, {
    Activity,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    FlatList,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
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

    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const filteredSuggestions = useMemo(
        () =>
            suggestions
                ?.filter(
                    s =>
                        s.toLowerCase().startsWith(word.toLowerCase()) &&
                        s.toLowerCase() !== word.toLowerCase(),
                )
                .slice(0, 2) ?? [],
        [suggestions, word],
    );

    useImperativeHandle(ref, () => ({
        focus: () => {
            setFocused(true);
            if (!isIOS) inputRef.current?.focus();
        },
    }));

    useEffect(() => {
        if (isIOS && focused) inputRef.current?.focus();
    }, [focused]);

    const handleTextChange = useCallback(
        (newWord: string) => {
            if (!active) return;
            onWordChange?.(newWord);
        },
        [active, onWordChange],
    );

    const handleBlur = useCallback(() => setFocused(false), []);

    const handleMicPress = useCallback(() => {
        voice.toggle({
            id: voiceId,
            languageCode,
            onResult: text => {
                trackEvent(AnalyticsEventName.MICROPHONE_WORD_INPUT);
                onWordChange?.(text);
            },
        });
    }, [languageCode, onWordChange, voice, voiceId]);

    const showingSuggestion = !word && !focused && filteredSuggestions.length > 0;

    return (
        <View>
            <View style={[styles.root, style]}>
                <SquareFlag languageCode={languageCode} size={30} style={styles.flag} />
                <View style={styles.inputContainer}>
                    {isIOS ? (
                        <>
                            <Activity mode={focused ? 'visible' : 'hidden'}>
                                <TextInput
                                    autoCapitalize={'none'}
                                    autoCorrect={true}
                                    cursorColor={active ? colors.primary : 'transparent'}
                                    multiline={true}
                                    ref={inputRef}
                                    scrollEnabled={false}
                                    style={[styles.input, styles.inputIOS]}
                                    textContentType={'none'}
                                    value={word}
                                    onBlur={handleBlur}
                                    onChangeText={handleTextChange}
                                    onFocus={() => setFocused(true)}
                                    {...rest}
                                />
                            </Activity>
                            <Activity mode={focused ? 'hidden' : 'visible'}>
                                <Pressable
                                    style={styles.inputPressable}
                                    onPress={() => setFocused(true)}
                                >
                                    <Text
                                        style={[
                                            styles.input,
                                            styles.inputIOS,
                                            showingSuggestion && styles.inputAsPlaceholder,
                                            styles.inputText,
                                        ]}
                                    >
                                        {showingSuggestion ? filteredSuggestions[0] : word}
                                    </Text>
                                </Pressable>
                            </Activity>
                        </>
                    ) : (
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={true}
                            cursorColor={active ? colors.primary : 'transparent'}
                            multiline={true}
                            placeholder={showingSuggestion ? filteredSuggestions[0] : undefined}
                            placeholderTextColor={colors.cardAccent}
                            ref={inputRef}
                            scrollEnabled={false}
                            style={styles.input}
                            textContentType={'none'}
                            value={word}
                            onBlur={handleBlur}
                            onChangeText={handleTextChange}
                            onFocus={() => setFocused(true)}
                            {...rest}
                        />
                    )}
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
                    keyExtractor={item => item}
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
        inputPressable: {
            flex: 1,
        },
        inputText: {
            flex: 0,
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
