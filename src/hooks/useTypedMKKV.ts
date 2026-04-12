import { MMKV, useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';

export function useTypedMMKV<T extends string>(
    key: string,
    defaultValue: T,
    storage: MMKV,
): [T, (value: T) => void];

export function useTypedMMKV<T extends number>(
    key: string,
    defaultValue: T,
    storage: MMKV,
): [T, (value: T) => void];

export function useTypedMMKV<T extends boolean>(
    key: string,
    defaultValue: T,
    storage: MMKV,
): [T, (value: T) => void];

export function useTypedMMKV<T extends string | number | boolean>(
    key: string,
    defaultValue: T,
    storage: MMKV,
): [T, (value: T) => void] {
    const [stringValue, setStringValue] = useMMKVString(key, storage);
    const [numberValue, setNumberValue] = useMMKVNumber(key, storage);
    const [booleanValue, setBooleanValue] = useMMKVBoolean(key, storage);

    if (typeof defaultValue === 'string') {
        return [
            (stringValue ?? defaultValue) as T,
            value => setStringValue(value as unknown as string),
        ];
    }

    if (typeof defaultValue === 'number') {
        return [
            (numberValue ?? defaultValue) as T,
            value => setNumberValue(value as unknown as number),
        ];
    }

    return [
        (booleanValue ?? defaultValue) as T,
        value => setBooleanValue(value as unknown as boolean),
    ];
}
