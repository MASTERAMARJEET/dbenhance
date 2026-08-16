export const SERVICE_CATEGORIES = {
	"salon-hair": {
		label: "Salon Hair",
		description: "Cuts, colouring, spa, smoothing, and scalp treatments",
	},
	"hair-fixing": {
		label: "Hair Fixing",
		description: "Non-surgical bonding, weaving, extensions, and custom systems",
	},
	nail: {
		label: "Nail Care",
		description: "Manicures, pedicures, nail art, and acrylic extensions",
	},
	skin: {
		label: "Skin & Beauty",
		description: "Threading, facials, waxing, bleach, and detan",
	},
	grooming: {
		label: "Grooming & Occasions",
		description: "Men's grooming, makeup, bridal packages, and sittings",
	},
} as const;

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES;

export const SERVICE_CATEGORY_ORDER: ServiceCategory[] = [
	"salon-hair",
	"hair-fixing",
	"nail",
	"skin",
	"grooming",
];

export function getServiceCategoryLabel(category: string): string {
	return SERVICE_CATEGORIES[category as ServiceCategory]?.label ?? category;
}
