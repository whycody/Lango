import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, spacing } from '../../constants/margins';
import { RootStackParamList, ScreenName } from '../../navigation/navigationTypes';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';
import { MasteryFilter } from './MasteryFilterBottomSheet';

export const FLASHCARD_CLASSES_INFO_SHEET = 'flashcard-classes-info-sheet';

export const FlashcardClassesInfoBottomSheet = () => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const classes: { color: string; desc: string; filter: MasteryFilter; label: string }[] = [
        {
            color: colors.red,
            desc: t('flashcard_classes.class_1_desc'),
            filter: 'learning',
            label: t('flashcard_classes.class_1_title'),
        },
        {
            color: colors.yellow,
            desc: t('flashcard_classes.class_2_desc'),
            filter: 'review',
            label: t('flashcard_classes.class_2_title'),
        },
        {
            color: colors.green,
            desc: t('flashcard_classes.class_3_desc'),
            filter: 'mastered',
            label: t('flashcard_classes.class_3_title'),
        },
    ];

    const handleGotIt = () => {
        TrueSheet.dismiss(FLASHCARD_CLASSES_INFO_SHEET);
    };

    const handleReviewWords = () => {
        TrueSheet.dismiss(FLASHCARD_CLASSES_INFO_SHEET);
        navigation.navigate(ScreenName.Flashcards);
    };

    const handleClassPress = (filter: MasteryFilter) => {
        TrueSheet.dismiss(FLASHCARD_CLASSES_INFO_SHEET);
        navigation.navigate(ScreenName.Flashcards, { masteryFilter: filter });
    };

    return (
        <GenericBottomSheet
            description={t('flashcard_classes.desc')}
            primaryActionLabel={t('flashcard_classes.got_it')}
            secondaryActionLabel={t('flashcard_classes.review_words')}
            sheetName={FLASHCARD_CLASSES_INFO_SHEET}
            title={t('flashcard_classes.title')}
            onPrimaryButtonPress={handleGotIt}
            onSecondaryButtonPress={handleReviewWords}
        >
            <View style={styles.list}>
                {classes.map(({ color, desc, filter, label }, i) => (
                    <Pressable key={i} style={styles.row} onPress={() => handleClassPress(filter)}>
                        <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
                            <Ionicons color={color} name="albums" size={16} />
                        </View>
                        <View style={styles.text}>
                            <CustomText
                                style={[styles.label, { color: colors.white }]}
                                weight={'Bold'}
                            >
                                {label}
                            </CustomText>
                            <CustomText style={[styles.desc, { color: colors.white300 }]}>
                                {desc}
                            </CustomText>
                        </View>
                        <Ionicons color={colors.white300} name="chevron-forward" size={16} />
                    </Pressable>
                ))}
            </View>
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    desc: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 2,
    },
    iconWrap: {
        alignItems: 'center',
        borderRadius: 10,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    label: {
        fontSize: 14,
    },
    list: {
        gap: spacing.m,
        marginTop: spacing.l,
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.m,
    },
    text: {
        flex: 1,
    },
});
