import React, { forwardRef, RefObject } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../store';
import { Language } from '../../types';
import { LanguageLevelPicker } from '../containers';
import { GenericBottomSheet } from './GenericBottomSheet';

export const PickLanguageLevelBottomSheet = forwardRef<
    BottomSheetModal,
    PickLanguageLevelBottomSheetProps
>((props, ref: RefObject<BottomSheetModal>) => {
    const { t } = useTranslation();
    const { mainLang } = useLanguage();

    const handleChangeIndex = (index?: number) => {
        if (props.onChangeIndex) props.onChangeIndex(index);
    };

    const dismiss = () => {
        ref && typeof ref !== 'function' && ref.current?.dismiss();
    };

    // Do not allow dismissing when user doesn't have information about language level
    // and has already picked it in previous version of app
    const allowDismiss = mainLang !== props.language?.languageCode;

    return (
        <GenericBottomSheet
            allowDismiss={allowDismiss}
            primaryActionLabel={t('general.cancel')}
            primaryButtonEnabled={allowDismiss}
            ref={ref}
            onChangeIndex={handleChangeIndex}
            onPrimaryButtonPress={dismiss}
        >
            <LanguageLevelPicker language={props.language} onLevelPick={dismiss} />
        </GenericBottomSheet>
    );
});

type PickLanguageLevelBottomSheetProps = {
    language?: Language;
    onChangeIndex?: (index: number) => void;
};
