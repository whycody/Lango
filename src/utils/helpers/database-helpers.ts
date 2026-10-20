// SQLite has no boolean type - booleans are stored as INTEGER 0/1.
export const toSqlBoolean = (value: boolean | undefined): 0 | 1 => (value ? 1 : 0);

export const fromSqlBoolean = (value: 0 | 1 | null): boolean => value === 1;

// For optional boolean fields where a missing value means "not applicable": keep NULL in SQLite
// instead of coercing it to 0.
export const toNullableSqlBoolean = (value: boolean | undefined): 0 | 1 | null =>
    value === undefined ? null : toSqlBoolean(value);

export const fromNullableSqlBoolean = (value: 0 | 1 | null): boolean | undefined =>
    value === null ? undefined : fromSqlBoolean(value);

// `?, ?, ?` for binding `count` values in an `IN (...)` or `VALUES (...)` clause.
export const buildSqlPlaceholders = (count: number): string =>
    Array.from({ length: count }, () => '?').join(', ');
