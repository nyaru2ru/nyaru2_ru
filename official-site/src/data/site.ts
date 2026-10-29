export const site = {
    name: "名前入れる",
    fullName: "ここにフルネームを入れる",
    get description() {
        return `${this.fullName}の活動や配信予定、動画、作品、お知らせなどをまとめたサイトです。`;
    },
    allowSearchIndexing: false,
};

export const navigation = [
    { label: "Home", href: "/" },
    { label: "About me", href: "/about/" },
    { label: "Social", href: "/social/" },
    { label: "Activity", href: "/activity/" },
    { label: "Contents", href: "/contents/" },
    { label: "Guidelines", href: "/guidelines/" },
    { label: "Fan Art", href: "/fan-art/" },
    { label: "Contact", href: "/contact/" },
] as const;
