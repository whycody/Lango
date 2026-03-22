import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getTodayDate } from './dateUtil';

export const exportData = async () => {
    const fileName = `lango_data_${getTodayDate()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    const json = await getAllAsyncStorageData();
    await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    Alert.alert('Eksport danych', 'Co chcesz zrobić z plikiem?', [
        { onPress: () => Sharing.shareAsync(fileUri), text: 'Udostępnij' },
        { onPress: () => saveToDownloads(fileName), text: 'Zapisz do Pobranych' },
        { style: 'cancel', text: 'Anuluj' },
    ]);
};

const getAllAsyncStorageData = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const data = await AsyncStorage.multiGet(keys);

        const parsedData = Object.fromEntries(
            data.map(([key, value]) => {
                try {
                    return [key, JSON.parse(value)];
                } catch {
                    return [key, value];
                }
            }),
        );

        return JSON.stringify(parsedData, null, 2);
    } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        return '{}';
    }
};

const saveToDownloads = async (fileName: string) => {
    if (Platform.OS === 'android') {
        const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
            console.warn('Brak uprawnień do zapisu w Downloads');
            return;
        }

        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json',
        );

        const json = await getAllAsyncStorageData();
        await FileSystem.writeAsStringAsync(uri, json, {
            encoding: FileSystem.EncodingType.UTF8,
        });
    }
};
