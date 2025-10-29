import { useMMKVNumber, useMMKVString } from 'react-native-mmkv';

type MMKVValue = string | number;

export function useTypedMMKV<T extends MMKVValue>(
  key: string,
  defaultValue: T,
  storage: any
): [T, (value: T) => void] {
  if (typeof defaultValue === 'string') {
    const [value, setValue] = useMMKVString(key, storage);
    return [
      (value ?? defaultValue) as T,
      (v: T) => setValue(v as string)
    ] as const;
  } else {
    const [value, setValue] = useMMKVNumber(key, storage);
    return [
      (value ?? defaultValue) as T,
      (v: T) => setValue(v as number)
    ] as const;
  }
}