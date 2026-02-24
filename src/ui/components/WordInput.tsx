import React, { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import SquareFlag from "./SquareFlag";
import { FlatList, Pressable, StyleSheet, TextInputProps, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../constants/margins";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { LanguageCode } from "../../constants/LanguageCode";

type WordInputProps = TextInputProps & {
  id: string;
  word: string;
  active: boolean;
  onWordCommit?: (word: string) => void;
  onWordChange?: (word: string) => void;
  languageCode: LanguageCode;
  onMicrophonePermissionsNotGranted?: () => void;
  suggestions?: string[];
  style?: any;
};

const WordInput: FC<WordInputProps> = forwardRef((props, ref) => {
  const {
    id, word, active, onWordCommit, onWordChange, languageCode, suggestions, style,
    onMicrophonePermissionsNotGranted, ...rest
  } = props;
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [focused, setFocused] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [internalWord, setInternalWord] = useState(word);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  const voice = useVoiceInput({
    id,
    languageCode,
    onResult: (text) => {
      setInternalWord(text);
      onWordChange?.(text);
    },
    onEnd: (result: string) => {
      onWordCommit?.(result);
    },
    onPermissionDenied: onMicrophonePermissionsNotGranted
  });

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clearWord: () => setInternalWord(''),
    getWord: () => internalWord,
  }));

  useEffect(() => {
    const filteredSuggestions = suggestions ? suggestions.filter((suggestion) =>
      suggestion.toLowerCase().startsWith(internalWord.toLowerCase()) && suggestion.toLowerCase() !== internalWord.toLowerCase()
    ).slice(0, 2) : [];

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
        <SquareFlag size={30} style={{ marginRight: 10 }} languageCode={languageCode}/>
        <View style={styles.inputContainer}>
          <BottomSheetTextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={active ? colors.primary : 'transparent'}
            autoCapitalize={'none'}
            textContentType={'none'}
            autoCorrect={true}
            multiline={true}
            value={internalWord}
            scrollEnabled={true}
            placeholder={(currentSuggestions && !focused && currentSuggestions) ? currentSuggestions[0] : undefined}
            placeholderTextColor={colors.cardAccent}
            onFocus={setFocused}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            {...rest}
          />
          <Ionicons
            name={'mic-sharp'}
            color={voice.recording ? colors.primary : colors.primary600}
            size={24}
            style={styles.icon}
            onPress={voice.toggle}
          />
        </View>
      </View>
      {currentSuggestions.length > 0 && focused && (
        <FlatList
          data={currentSuggestions}
          scrollEnabled={false}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSuggestionPress(item)}>
              <View style={styles.suggestionItem}>
                <CustomText style={styles.suggestionText}>{item}</CustomText>
              </View>
            </Pressable>
          )}
          style={styles.suggestionsList}
        />
      )}
    </View>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: `Montserrat-Regular`,
    color: colors.primary300,
    paddingHorizontal: MARGIN_HORIZONTAL / 2,
    backgroundColor: colors.background,
    fontSize: 16,
    minHeight: 42,
    lineHeight: 30,
  },
  inputContainer: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: MARGIN_HORIZONTAL / 2
  },
  icon: {
    padding: 6.5,
  },
  suggestionsList: {
    marginTop: 10,
    borderColor: colors.border,
  },
  suggestionItem: {
    marginTop: 5,
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary300,
  },
});

export default WordInput;