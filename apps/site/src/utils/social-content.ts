import { getEmDashCollection } from "emdash";
import type { FeaturedReel, GalleryItem } from "../../emdash-env";

export interface ReelCard {
	href: string;
	posterSrc?: string;
	videoSrc?: string;
	title: string;
}

export interface GalleryCard {
	href: string;
	src?: string;
	alt: string;
	isVideo?: boolean;
}

type MediaField = { id?: string; src?: string; alt?: string } | null | undefined;

function mediaSrc(field: MediaField): string | undefined {
	return field?.src;
}

function sortByOrder<T extends { data: { sort_order?: number | null } }>(
	entries: T[],
): T[] {
	return [...entries].sort(
		(a, b) => (a.data.sort_order ?? 0) - (b.data.sort_order ?? 0),
	);
}

function mapFeaturedReel(entry: FeaturedReel): ReelCard | null {
	if (!entry.link) return null;

	return {
		href: entry.link,
		posterSrc: mediaSrc(entry.thumbnail),
		videoSrc: mediaSrc(entry.video),
		title: entry.title,
	};
}

function mapGalleryItem(entry: GalleryItem): GalleryCard | null {
	if (!entry.link) return null;

	return {
		href: entry.link,
		src: mediaSrc(entry.thumbnail),
		alt: entry.title,
		isVideo: Boolean(entry.is_video),
	};
}

export async function getFeaturedReels(limit?: number) {
	const { entries } = await getEmDashCollection("featured_reels", {
		status: "published",
		limit: limit ?? 100,
	});

	return sortByOrder(entries)
		.map((entry) => mapFeaturedReel(entry.data))
		.filter((item): item is ReelCard => item !== null);
}

export async function getGalleryItems(limit?: number) {
	const { entries } = await getEmDashCollection("gallery_items", {
		status: "published",
		limit: limit ?? 100,
	});

	return sortByOrder(entries)
		.map((entry) => mapGalleryItem(entry.data))
		.filter((item): item is GalleryCard => item !== null);
}
