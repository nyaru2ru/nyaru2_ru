export type ContentKind = "goods" | "cover" | "video";

export type ContentItem = {
    id: string;
    kind: ContentKind;
    title: string;
    description?: string;
    image?: string;
    url?: string;
    date?: string;
};

export const contentItems: ContentItem[] = [];
