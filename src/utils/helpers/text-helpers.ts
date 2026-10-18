// Combining diacritical marks left after NFD decomposition (e.g. "ż" -> "z" + U+0307).
const COMBINING_MARKS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');

// Lowercases and strips diacritics so search matches regardless of case and accents
// ("zolw" matches "Żółw"). "ł" has no NFD decomposition, so it's mapped explicitly.
export const normalizeForSearch = (text: string): string =>
    text.toLocaleLowerCase().normalize('NFD').replace(COMBINING_MARKS_REGEX, '').replace(/ł/g, 'l');
