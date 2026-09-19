import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { useLanguage } from '../../../store';
import { ThemeColors, WordsBundleWithOwnerInfo } from '../../../types';
import { EmptyList, ListFilter } from '../../../ui/components/flashcards';
import { CustomTheme } from '../../../ui/Theme';
import { SearchBundleListItem } from './components/search-bundle-list-item';
import { SEARCH_DEBOUNCE_MS, SEARCH_LIST_END_REACHED_THRESHOLD } from './constants';
import { useSearchBundlesQuery } from './hooks/use-search-bundles-query';

type SearchBundlesScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

const keyExtractor = (item: WordsBundleWithOwnerInfo) => item.id;

export const SearchBundlesScreen = ({ navigation }: { navigation: SearchBundlesScreenNavProp }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);
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
        <SearchBundleListItem bundle={item} index={index} onPress={handleBundlePress} />
    );

    const listEmptyComponent = isLoading ? null : (
        <EmptyList
            descriptionTx={query ? 'bundles.empty_search_desc' : 'bundles.start_search_desc'}
            titleTx={query ? 'bundles.empty_search' : 'bundles.start_search'}
        />
    );

    const listFooterComponent =
        isLoading || isFetchingNextPage ? (
            <ActivityIndicator color={colors.white300} style={styles.loader} />
        ) : null;

    const handleListFilterClear = () => {
        setQuery('');
    };

    const handleFlatListOnEndReached = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer} />
            <View style={styles.searchHeaderContainer}>
                <Ionicons
                    color={colors.white300}
                    name="arrow-back-sharp"
                    size={24}
                    style={styles.backIcon}
                    onPress={navigation.goBack}
                />
                <ListFilter
                    autoFocus
                    isSearching
                    placeholderTx="bundles.start_search"
                    ref={inputRef}
                    value={query}
                    onChangeText={setQuery}
                    onClear={handleListFilterClear}
                />
            </View>
            <FlatList
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={listFooterComponent}
                contentContainerStyle={styles.list}
                data={remoteBundles}
                keyExtractor={keyExtractor}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                renderItem={renderItem}
                onEndReached={handleFlatListOnEndReached}
                onEndReachedThreshold={SEARCH_LIST_END_REACHED_THRESHOLD}
            />
        </View>
    );
};

const getStyles = (colors: ThemeColors, insets: EdgeInsets) =>
    StyleSheet.create({
        backIcon: {
            marginRight: spacing.l,
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
            marginTop: spacing.l,
            paddingBottom: spacing.l,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            height: insets.top,
            justifyContent: 'center',
        },
    });
