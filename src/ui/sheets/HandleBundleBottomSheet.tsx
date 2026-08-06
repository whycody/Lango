import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
import { BUNDLE_DESCRIPTION_MAX_LENGTH, BUNDLE_TITLE_MAX_LENGTH } from '../../constants/WordsBundle';
import { useWordsBundle } from '../../store';
import { WordsBundle } from '../../types';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type HandleBundleBottomSheetProps = {
    bundleId?: string;
    sheetName: string;
    onBundleCreated: (bundle: WordsBundle) => void;
};

export const HandleBundleBottomSheet = (props: HandleBundleBottomSheetProps) => {
    const { bundleId, onBundleCreated, sheetName } = props;
    const { bundles, createBundle, editBundle } = useWordsBundle();
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const bundle = bundleId ? bundles.find(b => b.id === bundleId) : undefined;
    const isEditing = !!bundle;

    const [titleInput, setTitleInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');

    const descriptionInputRef = useRef<TextInput>(null);

    const isConfirmed = titleInput.trim().length > 0;

    useEffect(() => {
        setTitleInput(bundle?.title ?? '');
        setDescriptionInput(bundle?.description ?? '');
    }, [bundle]);

    const handleDismiss = () => {
        setTitleInput('');
        setDescriptionInput('');
    };

    const handlePrimaryButtonPress = () => {
        const title = titleInput.trim();
        const description = descriptionInput.trim() || undefined;

        if (isEditing && bundle) {
            editBundle({ description, id: bundle.id, title });
            TrueSheet.dismissAll();
            return;
        }

        const newBundle = createBundle(title, description, 'public');
        TrueSheet.dismissAll();
        onBundleCreated(newBundle);
    };

    const handleTitleSubmitEditing = () => {
        descriptionInputRef.current?.focus();
    };

    const handleDescriptionSubmitEditing = () => {
        if (!isConfirmed) return;
        handlePrimaryButtonPress();
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            description={t(
                isEditing ? 'bundle_details.edit_bundle_desc' : 'bundles.create_new_desc',
            )}
            primaryActionLabel={t(
                isEditing ? 'bundle_details.edit_bundle_confirm' : 'bundles.create_new_confirm',
            )}
            primaryButtonEnabled={isConfirmed}
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            title={t(isEditing ? 'bundle_details.edit_bundle' : 'bundles.create_new_title')}
            onDidDismiss={handleDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <View style={styles.inputContainer}>
                <TextInput
                    autoFocus
                    autoCapitalize="sentences"
                    autoCorrect={true}
                    cursorColor={colors.primary300}
                    maxLength={BUNDLE_TITLE_MAX_LENGTH}
                    placeholder={t('bundles.create_new_placeholder')}
                    placeholderTextColor={colors.white600}
                    returnKeyType="next"
                    style={styles.textInput}
                    submitBehavior="submit"
                    value={titleInput}
                    onChangeText={setTitleInput}
                    onSubmitEditing={handleTitleSubmitEditing}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    multiline
                    autoCapitalize="sentences"
                    autoCorrect={true}
                    cursorColor={colors.primary300}
                    maxLength={BUNDLE_DESCRIPTION_MAX_LENGTH}
                    placeholder={t('bundles.create_new_description_placeholder')}
                    placeholderTextColor={colors.white600}
                    ref={descriptionInputRef}
                    returnKeyType="done"
                    style={[styles.textInput, styles.descriptionInput]}
                    submitBehavior="blurAndSubmit"
                    value={descriptionInput}
                    onChangeText={setDescriptionInput}
                    onSubmitEditing={handleDescriptionSubmitEditing}
                />
            </View>
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        descriptionInput: {
            minHeight: 70,
            textAlignVertical: 'top',
        },
        inputContainer: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.m,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        textInput: {
            color: colors.white,
            fontFamily: `Montserrat-Regular`,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 14,
        },
    });
