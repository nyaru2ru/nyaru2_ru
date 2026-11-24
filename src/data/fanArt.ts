import mediaData from "../content/media.json";
import { getPublicUrl } from "./links";

export type FanArtEntry = {
  title: string;
  artist: string;
  image: string;
  alt?: string;
  artistUrl?: string;
};

type FanArtRecord = Partial<FanArtEntry> & { permissionGranted?: boolean };

export const fanArtItems: FanArtEntry[] = (mediaData.fanArt as FanArtRecord[])
  .filter((item): item is FanArtRecord & Required<Pick<FanArtEntry, "title" | "artist" | "image">> => item.permissionGranted === true &&
    typeof item.title === "string" && item.title.trim().length > 0 &&
    typeof item.artist === "string" && item.artist.trim().length > 0 &&
    typeof item.image === "string" &&
    /^\/images\/fan-art\/[^/\\?#]+\.(png|jpe?g|webp|avif)$/i.test(item.image))
  .map((item) => ({
    title: item.title.trim(),
    artist: item.artist.trim(),
    image: item.image,
    alt: typeof item.alt === "string" ? item.alt : undefined,
    artistUrl: getPublicUrl(item.artistUrl ?? null) ?? undefined,
  }));

export const fanArtPageSize = 24;
export const fanArtPageCount = Math.max(1, Math.ceil(fanArtItems.length / fanArtPageSize));

export function fanArtPageUrl(page: number): string {
  return page === 1 ? "/fan-art/" : `/fan-art/${page}/`;
}
