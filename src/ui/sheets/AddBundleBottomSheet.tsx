import React from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../constants/margins';
import { ActionButton } from '../components/ActionButton';
import { GenericBottomSheet } from './GenericBottomSheet';

type AddBundleBottomSheetProps = {
    sheetName: string;
    onCreateNew: () => void;
    onJoinWithCode: () => void;
};

export const AddBundleBottomSheet = (props: AddBundleBottomSheetProps) => {
    const { onCreateNew, onJoinWithCode, sheetName } = props;
    const { t } = useTranslation();

    const handleCreateNewPress = () => {
        TrueSheet.dismiss(sheetName);
        onCreateNew();
    };

    const handleJoinWithCodePress = () => {
        TrueSheet.dismiss(sheetName);
        onJoinWithCode();
    };

    return (
        <GenericBottomSheet
            description={t('bundles.add_new_desc')}
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.sheet}
            title={t('bundles.add_new_title')}
            onSecondaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            <ActionButton primary label={t('bundles.create_new')} onPress={handleCreateNewPress} />
            <ActionButton
                icon={'key'}
                label={t('bundles.join_with_code')}
                style={styles.secondaryButton}
                onPress={handleJoinWithCodePress}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    secondaryButton: {
        marginTop: 12,
    },
    sheet: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: 15,
    },
});
