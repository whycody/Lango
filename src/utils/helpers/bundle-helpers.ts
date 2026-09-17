export const buildBundleLink = (bundleId: string, lang: string, code?: string) =>
    `${process.env.SITE_URL}/bundle/${bundleId}?lang=${lang}${code ? `&code=${code}` : ''}`;
