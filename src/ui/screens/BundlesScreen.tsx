import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AppState, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { RootStackParamList, ScreenName } from '../../navigation/navigationTypes';
import { useLanguage, useStatistics, useWordsBundle } from '../../store';
import { EnrichedWordsBundle } from '../../store/WordsBundleContext';
import { Streak } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { getCurrentStreak, getPrevMilestone } from '../../utils/streakUtils';
import { ActionButton, BottomGradient, CustomText, ScreenHeader } from '../components';
import { BundleItem } from '../components/bundles';
import { AddBundleBottomSheet, LanguageBottomSheet } from '../sheets';
import { CustomTheme } from '../Theme';

const BUNDLES_LANGUAGE_SHEET_NAME = 'bundles-language-sheet';
const ADD_BUNDLE_SHEET_NAME = 'add-bundle-sheet';

export const BundlesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang } = useLanguage();
    const { studyDaysList } = useStatistics();
    const bundles = useWordsBundle();
    const styles = getStyles(colors, insets);

    const [refreshing, setRefreshing] = useState(false);

    const [streak, setStreak] = useState<Streak>({
        active: false,
        numberOfDays: 0,
    });

    useLayoutEffect(() => {
        setStreak(getCurrentStreak(studyDaysList));
    }, [studyDaysList]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', state => {
            if (state !== 'active') return;
            setStreak(getCurrentStreak(studyDaysList));
        });

        return () => subscription.remove();
    }, [studyDaysList]);

    const isGoal = streak.active && streak.numberOfDays === getPrevMilestone(streak.numberOfDays);

    const handleLanguageSheetOpen = useCallback(() => {
        trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
            source: 'bundles_screen',
            type: 'main',
        });
        TrueSheet.present(BUNDLES_LANGUAGE_SHEET_NAME);
    }, []);

    const handleAddNewPress = useCallback(() => {
        TrueSheet.present(ADD_BUNDLE_SHEET_NAME);
    }, []);

    const handleCreateNewBundle = useCallback(() => {
        // TODO: navigate to create bundle flow
    }, []);

    const handleJoinBundleWithCode = useCallback(() => {
        // TODO: navigate to join bundle flow
    }, []);

    const handleBundlePress = useCallback(
        (bundle: EnrichedWordsBundle) => {
            navigation.navigate(ScreenName.BundleDetails, { bundleId: bundle.id });
        },
        [navigation],
    );

    const renderBundleItem = ({ index, item }: { index: number; item: EnrichedWordsBundle }) => (
        <BundleItem key={item.id} bundle={item} index={index} onPress={handleBundlePress} />
    );

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await bundles.syncBundles();
        } finally {
            setRefreshing(false);
        }
    }, [bundles]);

    return (
        <>
            <BottomGradient />
            <LanguageBottomSheet sheetName={BUNDLES_LANGUAGE_SHEET_NAME} />
            <AddBundleBottomSheet
                sheetName={ADD_BUNDLE_SHEET_NAME}
                onCreateNew={handleCreateNewBundle}
                onJoinWithCode={handleJoinBundleWithCode}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        progressViewOffset={50}
                        refreshing={refreshing}
                        tintColor={colors.text}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.spacer} />
                <ScreenHeader
                    mainLang={mainLang}
                    streakActive={streak.active}
                    streakIsGoal={isGoal}
                    streakNumberOfDays={streak.numberOfDays}
                    title={t('bundles.title')}
                    onFlagPress={handleLanguageSheetOpen}
                />
                <CustomText style={styles.descText}>{t('bundles.desc')}</CustomText>
                <ActionButton
                    primary
                    label={t('bundles.add_new')}
                    style={styles.actionButton}
                    onPress={handleAddNewPress}
                />
                <FlatList
                    ListFooterComponent={<View style={styles.footer} />}
                    contentContainerStyle={styles.list}
                    data={bundles.langBundles}
                    renderItem={renderBundleItem}
                    scrollEnabled={false}
                />
            </ScrollView>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        actionButton: {
            marginTop: MARGIN_VERTICAL,
        },
        container: {
            flex: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        descText: {
            color: colors.white,
            fontSize: 14,
            lineHeight: 22,
            marginTop: 12,
            opacity: 0.8,
        },
        footer: {
            height: 50,
        },
        list: {
            marginTop: MARGIN_VERTICAL,
        },
        spacer: {
            height: insets.top + MARGIN_VERTICAL,
        },
    });
