export const getTodayDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

export const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getCurrentISO = () => new Date().toISOString();

export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

type DateInput = string | number | Date;

export const toTimestamp = (date: DateInput): number | null => {
    const timestamp = new Date(date).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
};

export const getTimeDifferenceMs = (from: DateInput, to: DateInput = Date.now()): number | null => {
    const fromTs = toTimestamp(from);
    const toTs = toTimestamp(to);

    if (fromTs === null || toTs === null) return null;
    return toTs - fromTs;
};

export const formatHoursSince = (hours: number): string => {
    if (hours === 0) return '—';
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
};

export const formatDisplayDate = (date: DateInput): string =>
    new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
