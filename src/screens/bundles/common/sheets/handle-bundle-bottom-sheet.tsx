import { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { LabeledTextInput } from '../../../../components';
import { useWordsBundle } from '../../../../store';
import { WordsBundle } from '../../../../types';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { BUNDLE_DESCRIPTION_MAX_LENGTH, BUNDLE_TITLE_MAX_LENGTH } from '../constants';

type HandleBundleBottomSheetProps = {
    bundleId?: string;
    sheetName: string;
    onBundleCreated: (bundle: WordsBundle) => void;
};

export const HandleBundleBottomSheet = (props: HandleBundleBottomSheetProps) => {
    const { bundleId, onBundleCreated, sheetName } = props;
    const { bundles, createBundle, editBundle } = useWordsBundle();

    const bundle = bundleId ? bundles.find(b => b.id === bundleId) : undefined;
    const isEditing = !!bundle;

    const [titleInput, setTitleInput] = useState(bundle?.title ?? '');
    const [descriptionInput, setDescriptionInput] = useState(bundle?.description ?? '');

    const descriptionInputRef = useRef<TextInput>(null);
    const isConfirmed = titleInput.trim().length > 0;

    const handleSheetDismiss = () => {
        setTitleInput(bundle?.title ?? '');
        setDescriptionInput(bundle?.description ?? '');
    };

    const handlePrimaryButtonPress = () => {
        const title = titleInput.trim();
        const description = descriptionInput.trim();

        if (isEditing && bundle) {
            editBundle({ description: description || null, id: bundle.id, title });
            TrueSheet.dismissAll();
            return;
        }

        const newBundle = createBundle(title, description || undefined, 'public');
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

    const titleTx = isEditing ? 'bundle_details.edit.title' : 'bundles.create_new_title';
    const descriptionTx = isEditing ? 'bundle_details.edit.desc' : 'bundles.create_new_desc';
    const primaryActionLabelTx = isEditing
        ? 'bundle_details.edit.confirm'
        : 'bundles.create_new_confirm';

    return (
        <GenericBottomSheet
            descriptionTx={descriptionTx}
            primaryActionLabelTx={primaryActionLabelTx}
            primaryButtonEnabled={isConfirmed}
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            titleTx={titleTx}
            onDidDismiss={handleSheetDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <LabeledTextInput
                autoFocus
                labelTx="bundles.create_new_title_label"
                maxLength={BUNDLE_TITLE_MAX_LENGTH}
                returnKeyType="next"
                submitBehavior="submit"
                value={titleInput}
                onChangeText={setTitleInput}
                onSubmitEditing={handleTitleSubmitEditing}
            />
            <LabeledTextInput
                multiline
                inputRef={descriptionInputRef}
                labelTx="bundles.create_new_description_label"
                maxLength={BUNDLE_DESCRIPTION_MAX_LENGTH}
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                value={descriptionInput}
                onChangeText={setDescriptionInput}
                onSubmitEditing={handleDescriptionSubmitEditing}
            />
        </GenericBottomSheet>
    );
};
