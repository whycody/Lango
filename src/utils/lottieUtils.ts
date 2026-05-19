import { AnimationObject } from 'lottie-react-native';

type ColorFilter = { color: string; keypath: string };

const hexToLottieColor = (hex: string): [number, number, number, number] => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return [r, g, b, 1];
};

const lottieColorToHex = (color: number[]): string => {
    const toHex = (v: number) =>
        Math.round(v * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
};

const colorsMatch = (a: number[], b: number[]): boolean =>
    Math.round(a[0] * 255) === Math.round(b[0] * 255) &&
    Math.round(a[1] * 255) === Math.round(b[1] * 255) &&
    Math.round(a[2] * 255) === Math.round(b[2] * 255);

const replaceColorInObject = (obj: unknown, from: number[], to: number[]): void => {
    if (!obj || typeof obj !== 'object') return;

    if (
        (obj as Record<string, unknown>).ty === 'fl' ||
        (obj as Record<string, unknown>).ty === 'st'
    ) {
        const fill = obj as { c?: { k: number[] | number[][] } };
        if (fill.c) {
            const k = fill.c.k;
            if (Array.isArray(k[0])) {
                (k as Array<any>).forEach((keyframe: any) => {
                    if (
                        Array.isArray(keyframe) &&
                        Array.isArray(keyframe[1]) &&
                        colorsMatch(keyframe[1] as number[], from)
                    ) {
                        keyframe[1] = [...to];
                    }
                });
            } else if (colorsMatch(k as number[], from)) {
                fill.c.k = [...to];
            }
        }
    }

    for (const value of Object.values(obj as Record<string, unknown>)) {
        if (Array.isArray(value)) {
            value.forEach(item => replaceColorInObject(item, from, to));
        } else if (typeof value === 'object') {
            replaceColorInObject(value, from, to);
        }
    }
};

export const replaceLottieColor = (
    source: AnimationObject | Record<string, unknown>,
    replacements: Array<{ from: string; to: string }>,
): AnimationObject => {
    const clone = JSON.parse(JSON.stringify(source)) as AnimationObject;
    replacements.forEach(({ from, to }) =>
        replaceColorInObject(clone, hexToLottieColor(from), hexToLottieColor(to)),
    );
    return clone;
};

export const buildLottieColorFilters = (
    source: Record<string, unknown>,
    colorMap: Record<string, string>,
): ColorFilter[] => {
    const layers = (source.layers as Array<{ nm?: string }>) ?? [];
    return layers
        .filter(l => l.nm && colorMap[l.nm])
        .map(l => ({ color: colorMap[l.nm!], keypath: l.nm! }));
};

export { lottieColorToHex };
