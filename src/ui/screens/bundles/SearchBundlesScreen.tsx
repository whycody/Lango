import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useSearchBundlesQuery } from '../../../hooks';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { useLanguage } from '../../../store';
import { WordsBundleWithOwnerInfo } from '../../../types';
import { ModalDragHandle } from '../../components';
import { SearchBundleItem } from '../../components/bundles';
import { EmptyList, ListFilter } from '../../components/flashcards';
import { CustomTheme } from '../../Theme';

const SEARCH_DEBOUNCE_MS = 400;

export const SearchBundlesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, insets);
    const inputRef = useRef<TextInput>(null);
    const { mainLang, translationLang } = useLanguage();

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [query]);

    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
        useSearchBundlesQuery(debouncedQuery, mainLang, translationLang);

    const isSearchPending = query.trim() !== debouncedQuery;
    const isLoading = isSearchPending || isFetching;

    const remoteBundles = isSearchPending ? [] : (data?.pages.flatMap(page => page.data) ?? []);

    const handleBundlePress = (bundle: WordsBundleWithOwnerInfo) => {
        navigation.navigate(ScreenName.BundleNavigator, {
            bundleId: bundle.id,
            previewBundle: bundle,
        });
    };

    const renderItem = ({ index, item }: { index: number; item: WordsBundleWithOwnerInfo }) => (
        <SearchBundleItem bundle={item} index={index} onPress={handleBundlePress} />
    );

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer}>
                <ModalDragHandle />
            </View>
            <View style={styles.searchHeaderContainer}>
                <Ionicons
                    color={colors.white300}
                    name={'arrow-back-sharp'}
                    size={24}
                    style={styles.backIcon}
                    onPress={navigation.goBack}
                />
                <ListFilter
                    autoFocus
                    isSearching
                    placeholder={t('bundles.start_search')}
                    ref={inputRef}
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                />
            </View>
            <FlatList
                contentContainerStyle={styles.list}
                data={remoteBundles}
                keyExtractor={item => item.id}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                renderItem={renderItem}
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyList
                            title={t(query ? 'bundles.empty_search' : 'bundles.start_search')}
                            description={t(
                                query ? 'bundles.empty_search_desc' : 'bundles.start_search_desc',
                            )}
                        />
                    )
                }
                ListFooterComponent={
                    isLoading || isFetchingNextPage ? (
                        <ActivityIndicator color={colors.white300} style={styles.loader} />
                    ) : null
                }
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: { top: number }) =>
    StyleSheet.create({
        backIcon: {
            marginRight: 10,
        },
        list: {
            marginTop: MARGIN_VERTICAL,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        loader: {
            marginVertical: MARGIN_VERTICAL,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
        },
        searchHeaderContainer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            marginTop: MARGIN_VERTICAL / 2,
            paddingBottom: MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            height: insets.top,
            justifyContent: 'center',
        },
    });
