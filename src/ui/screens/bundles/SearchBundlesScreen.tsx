import { useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { RootStackParamList } from '../../../navigation/navigationTypes';
import { isIOS } from '../../../utils/deviceUtils';
import { ModalDragHandle } from '../../components';
import { EmptyList, ListFilter } from '../../components/flashcards';
import { CustomTheme } from '../../Theme';

export const SearchBundlesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, insets);
    const inputRef = useRef<TextInput>(null);

    const [query, setQuery] = useState('');

    const remoteBundles: never[] = [];

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
                keyboardShouldPersistTaps={'always'}
                renderItem={null}
                ListEmptyComponent={
                    <EmptyList
                        title={t(query ? 'bundles.empty_search' : 'bundles.start_search')}
                        description={t(
                            query ? 'bundles.empty_search_desc' : 'bundles.start_search_desc',
                        )}
                    />
                }
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
        root: {
            backgroundColor: colors.background,
            flex: 1,
        },
        searchHeaderContainer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            marginTop: MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            height: isIOS ? 16 : insets.top,
            justifyContent: 'center',
        },
    });
