import socialContent from "../content/social.json";
import { getPublicUrl } from "./links";

export const xAccounts = socialContent.xAccounts
  .filter((account) => typeof account.label === "string" && account.label.trim())
  .map((account) => ({
    label: account.label.trim(),
    description: typeof account.description === "string" ? account.description.trim() : "",
    href: getPublicUrl(account.url),
  }));

export const featuredVideos = socialContent.videos
  .filter((video) => video.published === true &&
    typeof video.title === "string" && video.title.trim() &&
    typeof video.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(video.videoId))
  .slice(0, 2)
  .map((video) => ({
    title: video.title.trim(),
    videoId: video.videoId,
    href: `https://www.youtube.com/watch?v=${video.videoId}`,
  }));

type TwitchArchive = {
  title: string;
  url: string;
  published?: boolean;
};

const archiveContent = socialContent as unknown as { twitchArchives?: TwitchArchive[] };
const archiveEntries: TwitchArchive[] = Array.isArray(archiveContent.twitchArchives)
  ? archiveContent.twitchArchives
  : [];

function getTwitchVideoId(input: string): string | null {
  const publicUrl = getPublicUrl(input);
  if (!publicUrl) return null;

  const url = new URL(publicUrl);
  if (!["twitch.tv", "www.twitch.tv", "m.twitch.tv"].includes(url.hostname.toLowerCase())) {
    return null;
  }

  const match = /^\/videos\/(\d+)\/?$/.exec(url.pathname);
  return match ? match[1] : null;
}

export const twitchArchives = archiveEntries
  .flatMap((archive) => {
    if (archive.published === false || typeof archive.title !== "string" || typeof archive.url !== "string") {
      return [];
    }

    const title = archive.title.trim();
    const videoId = getTwitchVideoId(archive.url);
    if (!title || !videoId) return [];

    return [{
      title,
      videoId,
      href: `https://www.twitch.tv/videos/${videoId}`,
    }];
  })
  .slice(0, 4);


type TwitchClip = {
  title: string;
  url: string;
  published?: boolean;
};

const clipContent = socialContent as unknown as { twitchClips?: TwitchClip[] };
const clipEntries: TwitchClip[] = Array.isArray(clipContent.twitchClips)
  ? clipContent.twitchClips
  : [];

function getTwitchClipSlug(input: string): string | null {
  const publicUrl = getPublicUrl(input);
  if (!publicUrl) return null;

  const url = new URL(publicUrl);
  const host = url.hostname.toLowerCase();

  if (host === "clips.twitch.tv") {
    return /^\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)?.[1] ?? null;
  }

  if (["twitch.tv", "www.twitch.tv", "m.twitch.tv"].includes(host)) {
    return /^\/[A-Za-z0-9_]+\/clip\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)?.[1] ?? null;
  }

  return null;
}

export const twitchClips = clipEntries
  .flatMap((clip) => {
    if (clip.published === false || typeof clip.title !== "string" || typeof clip.url !== "string") {
      return [];
    }

    const title = clip.title.trim();
    const clipSlug = getTwitchClipSlug(clip.url);
    if (!title || !clipSlug) return [];

    return [{
      title,
      clipSlug,
      href: `https://clips.twitch.tv/${clipSlug}`,
    }];
  })
  .slice(0, 4);
