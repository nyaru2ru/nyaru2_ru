export const site = {
    name: "にゃるる",
    fullName: "瑠羽 にゃるる",
    get description() {
        return `${this.fullName}公式HP`;
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
