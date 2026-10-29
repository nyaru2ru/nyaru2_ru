export type PublicLink = {
    id: string;
    label: string;
    description: string;
    url: string | null;
};

export const socialLinks: readonly PublicLink[] = [
    {
        id: 'twitch',
        label: 'Twitch',
        description: 'ライブ配信を見る',
        url: null,
    },
    {
        id: 'youtube',
        label: 'YouTube',
        description: '動画・配信のチャンネル',
        url: null,
    },
    {
        id: 'x',
        label: 'X',
        description: '日常の投稿やお知らせ',
        url: null,
    },
];

export const salesLinks: readonly PublicLink[] = [
    {
        id: 'sales-01',
        label: 'ここに販売ページ名1を入れる',
        description: 'ここに販売内容の説明1を入れる',
        url: null,
    },
    {
        id: 'sales-02',
        label: 'ここに販売ページ名2を入れる',
        description: 'ここに販売内容の説明2を入れる',
        url: null,
    },
];

export const contactLinks: readonly PublicLink[] = [
    {
        id: 'contact-work',
        label: 'コラボ・お仕事のご相談',
        description:
            'コラボや企業・イベント関係のお問い合わせはこちらです。',
        url: null,
    },
    {
        id: 'contact-general',
        label: 'お問い合わせ',
        description:
            'ここにお問い合わせについての案内',
        url: null,
    },
];

const invalidUrlCharacters = /[\u0000-\u001F\u007F\\]/;

export function getPublicUrl(value: string | null): string | null {
    if (!value || invalidUrlCharacters.test(value)) return null;

    const input = value.trim();
    if (!/^https:\/\//i.test(input)) return null;

    try {
        const url = new URL(input);
        if (url.protocol !== 'https:' || url.username || url.password) return null;
        return url.href;
    } catch {
        return null;
    }
}

export function getSiteOrPublicUrl(value: string | null): string | null {
    if (!value || invalidUrlCharacters.test(value)) return null;

    const input = value.trim();
    if (input.startsWith('/') && !input.startsWith('//')) {
        try {
            const origin = 'https://site.invalid';
            const url = new URL(input, origin);
            return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : null;
        } catch {
            return null;
        }
    }

    return getPublicUrl(input);
}

export function getContactUrl(value: string | null): string | null {
    const publicUrl = getPublicUrl(value);
    if (publicUrl) return publicUrl;
    if (!value || invalidUrlCharacters.test(value)) return null;

    const email = value.replace(/^mailto:/i, '').trim();
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return null;
    return `mailto:${email}`;
}
