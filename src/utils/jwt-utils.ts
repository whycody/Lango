// Decodes a JWT payload locally (no signature verification — we only need `exp` to decide
// whether to refresh before sending a request; the server is the actual source of truth).
export const decodeJwtExpiry = (token: string): number | null => {
    const payload = token.split('.')[1];
    if (!payload) return null;

    try {
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
    } catch {
        return null;
    }
};
