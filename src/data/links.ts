
import socialContent from "../content/social.json";

export type PublicLink = {
    id: string;
    label: string;
    description: string;
    url: string | null;
};

const firstX = socialContent.xAccounts[0];

export const socialLinks: readonly PublicLink[] = [
    {
        id: "twitch",
        label: "Twitch",
        description: socialContent.twitchDescription,
        url: socialContent.twitchUrl,
    },
    {
        id: "youtube",
        label: "YouTube",
        description: socialContent.youtubeDescription,
        url: socialContent.youtubeUrl,
    },
    {
        id: "x",
        label: "X",
        description: firstX?.description ?? "",
        url: firstX?.url ?? "",
    },
];

export const salesLinks: readonly PublicLink[] = [
    {
        id: "sales-01",
        label: "BOOTH",
        description: "シチュエーションボイスを中心に\nオリジナルグッズを販売中！",
        url: "https://nyaru2ru.booth.pm/",
    },
];

export const contactFormUrl: string = "";

export const contactLinks: readonly PublicLink[] = [
    {
        id: "contact-general",
        label: "お問い合わせ",
        description: "カスタムのお誘いや企業・イベント関係のお問い合わせ・その他問い合わせはGoogleフォームから受け付けています。",
        url: "https://forms.gle/u1Dgn1t69Bij9MTb8",
    },
];

const invalidUrlCharacters = /[\u0000-\u001F\u007F\\]/;

export function getPublicUrl(value: string | null): string | null {
    if (!value || invalidUrlCharacters.test(value)) return null;

    const input = value.trim();
    if (!/^https:\/\//i.test(input)) return null;

    try {
        const url = new URL(input);
        if (url.protocol !== "https:" || url.username || url.password) {
            return null;
        }
        return url.href;
    } catch {
        return null;
    }
}

export function getSiteOrPublicUrl(value: string | null): string | null {
    if (!value || invalidUrlCharacters.test(value)) return null;

    const input = value.trim();

    if (input.startsWith("/") && !input.startsWith("//")) {
        try {
            const origin = "https://site.invalid";
            const url = new URL(input, origin);
            return url.origin === origin
                ? `${url.pathname}${url.search}${url.hash}`
                : null;
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

    const email = value.replace(/^mailto:/i, "").trim();

    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
        return null;
    }

    return `mailto:${email}`;
}

export function getGoogleFormUrl(value: string | null): string | null {
    const publicUrl = getPublicUrl(value);
    if (!publicUrl) return null;

    const parsed = new URL(publicUrl);
    const host = parsed.hostname.toLowerCase();

    if (host === "forms.gle" && parsed.pathname.length > 1) {
        return publicUrl;
    }

    if (
        host === "docs.google.com" &&
        /^\/forms\/d\/(?:e\/)?[^/]+\/viewform\/?$/.test(parsed.pathname)
    ) {
        return publicUrl;
    }

    return null;
}
