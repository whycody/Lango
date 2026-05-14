import { FC, useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useDebouncedSyncSuggestions, useLanguage, useSuggestions } from '../../../store';
import { Suggestion } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { ActionButton, Header } from '../../components';
import { Flashcard } from '../../components/home';
import { CustomTheme } from '../../Theme';

type WordsSuggestionsCardProps = {
    style?: StyleProp<ViewStyle>;
};

export const WordsSuggestionsCard: FC<WordsSuggestionsCardProps> = ({ style }) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    const {
        increaseSuggestionsDisplayCount,
        langSuggestions,
        skipSuggestions,
        suggestions,
        syncSuggestions,
    } = useSuggestions();

    const { mainLang, translationLang } = useLanguage();
    const [firstFlashcard, setFirstFlashcard] = useState<Suggestion>();
    const [secondFlashcard, setSecondFlashcard] = useState<Suggestion>();
    const firstFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);
    const secondFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);

    useEffect(() => {
        const firstSuggestion = suggestions.find(s => s.id === firstFlashcard?.id);
        const secondSuggestion = suggestions.find(s => s.id === secondFlashcard?.id);

        const flashcardIsValid = (flashcard: Suggestion | undefined) =>
            flashcard &&
            flashcard.mainLang == mainLang &&
            flashcard.translationLang == translationLang &&
            !flashcard.added &&
            !flashcard.skipped;

        if (flashcardIsValid(firstSuggestion) && flashcardIsValid(secondSuggestion)) return;

        const sortedSuggestions = langSuggestions
            .slice()
            .sort((a, b) => a.displayCount - b.displayCount);
        const [firstNewSuggestion, secondNewSuggestion] = sortedSuggestions.slice(0, 2);

        setFirstFlashcard(firstNewSuggestion);
        setSecondFlashcard(secondNewSuggestion);

        if (!firstNewSuggestion && !secondNewSuggestion) return;

        increaseSuggestionsDisplayCount(
            [firstNewSuggestion, secondNewSuggestion].filter(Boolean).map(s => s.id),
        );
    }, [langSuggestions, suggestions, firstFlashcard, secondFlashcard, mainLang, translationLang]);

    const debouncedSyncSuggestions = useDebouncedSyncSuggestions(syncSuggestions, 3000);

    const flipFlashcards = () => {
        trackEvent(AnalyticsEventName.SUGGESTIONS_SKIPPED);
        if (firstFlashcard) firstFlashcardRef.current?.flipWithoutAdd();
        if (secondFlashcard) secondFlashcardRef.current?.flipWithoutAdd();
        debouncedSyncSuggestions();
    };

    const handleFlashcardPress = async (first: boolean, add: boolean) => {
        const suggestionId = first ? firstFlashcard?.id : secondFlashcard?.id;
        if (!suggestionId) return;

        await skipSuggestions([suggestionId], add ? 'added' : 'skipped');
        const currentFlashcardIds = [firstFlashcard?.id, secondFlashcard?.id].filter(
            (id): id is string => !!id,
        );
        const currentFlashcardIdsSet = new Set(currentFlashcardIds);

        const filteredSuggestions = langSuggestions.filter(
            suggestion => !currentFlashcardIdsSet.has(suggestion.id),
        );

        const newSuggestion = filteredSuggestions[first ? 0 : 1];

        if (newSuggestion) {
            await increaseSuggestionsDisplayCount([newSuggestion.id]);
        }

        first ? setFirstFlashcard(newSuggestion) : setSecondFlashcard(newSuggestion);
        debouncedSyncSuggestions();
    };

    return (
        <View style={[styles.root, style]}>
            <Header subtitle={t('wordSuggestionDesc')} title={t('wordsSuggestion')} />
            <View style={styles.flashcardsContainer}>
                <Flashcard
                    ref={firstFlashcardRef}
                    style={styles.firstFlashcard}
                    suggestion={firstFlashcard}
                    onFlashcardPress={(add: boolean) => handleFlashcardPress(true, add)}
                />
                <Flashcard
                    ref={secondFlashcardRef}
                    style={styles.secondFlashcard}
                    suggestion={secondFlashcard}
                    onFlashcardPress={(add: boolean) => handleFlashcardPress(false, add)}
                />
            </View>
            <ActionButton
                icon={'sync'}
                label={t('switch_suggestions')}
                style={styles.actionButton}
                onPress={flipFlashcards}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionButton: {
            marginTop: 16,
        },
        firstFlashcard: {
            flex: 1,
            marginRight: MARGIN_HORIZONTAL / 4,
        },
        flashcardsContainer: {
            flexDirection: 'row',
            marginTop: 14,
        },
        root: {
            backgroundColor: colors.card,
            borderColor: colors.cardAccent300,
            borderRadius: 14,
            borderWidth: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
        },
        secondFlashcard: {
            flex: 1,
            marginLeft: MARGIN_HORIZONTAL / 4,
        },
    });
