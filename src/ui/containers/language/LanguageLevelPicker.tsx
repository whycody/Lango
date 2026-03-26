import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_LEVEL_KEYS } from '../../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { useAuth, useLanguage } from '../../../store';
import { Language, LanguageLevelRange } from '../../../types';
import { Header } from '../../components';
import { LanguageItem, LanguageLevelItem } from '../../components/language';

type LanguageLevelPickerProps = {
    language?: Language;
    onLevelPick?: (level: LanguageLevelRange) => void;
    pickedLevel?: LanguageLevelRange;
    style?: StyleProp<ViewStyle>;
    updateUserData?: boolean;
};

export const LanguageLevelPicker: FC<LanguageLevelPickerProps> = ({
    language,
    onLevelPick,
    pickedLevel,
    style,
    updateUserData = true,
}) => {
    const { t } = useTranslation();
    const { setMainLang } = useLanguage();
    const { updateUserLanguageLevels } = useAuth();
    const haptics = useHaptics();

    const languageLevels = LANGUAGE_LEVEL_KEYS.map(l => ({
        code: l.code,
        desc: t(`language_level.${l.key}_desc`),
        label: t(`language_level.${l.key}`),
        level: l.level,
    }));

    const handleLanguageLevelPress = (level: LanguageLevelRange) => {
        onLevelPick?.(level);
        haptics.triggerHaptics('rigid');
        if (!updateUserData) return;
        updateUserLanguageLevels({ language: language.languageCode, level });
        setMainLang(language.languageCode);
    };

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t('language_level.select_desc')}
                title={t('language_level.select', {
                    language: language?.languageName.toLowerCase(),
                })}
            />
            {language && (
                <LanguageItem checked={false} index={0} language={language} showIcon={false} />
            )}
            {languageLevels.map(({ code, desc, label, level }) => (
                <LanguageLevelItem
                    key={level}
                    code={code}
                    desc={desc}
                    label={label}
                    level={level}
                    picked={level == pickedLevel}
                    onPress={handleLanguageLevelPress}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: MARGIN_HORIZONTAL,
        paddingVertical: MARGIN_VERTICAL / 2,
    },
});
